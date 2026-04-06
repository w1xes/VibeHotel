from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.booking import Booking
from app.models.property import Property
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/me", response_model=list[BookingOut])
async def get_my_bookings(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(Booking)
        .options(selectinload(Booking.property).selectinload(Property.images))
        .where(Booking.user_id == UUID(user["id"]))
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("", response_model=BookingOut, status_code=201)
async def create_booking(
    data: BookingCreate,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Verify property exists and get price
    prop = await db.get(Property, data.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if data.guests > prop.capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Property capacity is {prop.capacity}, requested {data.guests}",
        )

    nights = (data.check_out - data.check_in).days
    total_price = float(prop.price) * nights

    booking = Booking(
        user_id=UUID(user["id"]),
        property_id=data.property_id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        total_price=total_price,
        status="confirmed",
    )
    db.add(booking)
    await db.commit()

    # Refresh with relationships
    stmt = (
        select(Booking)
        .options(selectinload(Booking.property).selectinload(Property.images))
        .where(Booking.id == booking.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: UUID,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if str(booking.user_id) != user["id"]:
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")

    booking.status = "cancelled"
    await db.commit()

    stmt = (
        select(Booking)
        .options(selectinload(Booking.property).selectinload(Property.images))
        .where(Booking.id == booking.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


# ---- Admin endpoints ----

@router.get("", response_model=list[BookingOut])
async def get_all_bookings(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    stmt = (
        select(Booking)
        .options(selectinload(Booking.property).selectinload(Property.images))
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: UUID,
    data: BookingStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = data.status
    await db.commit()

    stmt = (
        select(Booking)
        .options(selectinload(Booking.property).selectinload(Property.images))
        .where(Booking.id == booking.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()
