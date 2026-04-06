from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import require_admin
from app.models.property import Property, PropertyImage
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[PropertyOut])
async def list_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    type: str | None = Query(None),
    min_capacity: int | None = Query(None, alias="minCapacity"),
    max_price: float | None = Query(None, alias="maxPrice"),
    search: str | None = Query(None),
    featured: bool | None = Query(None),
):
    stmt = select(Property).options(selectinload(Property.images))

    if type:
        stmt = stmt.where(Property.type == type)
    if min_capacity:
        stmt = stmt.where(Property.capacity >= min_capacity)
    if max_price:
        stmt = stmt.where(Property.price <= max_price)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Property.title.ilike(pattern) | Property.description.ilike(pattern)
        )
    if featured is not None:
        stmt = stmt.where(Property.featured == featured)

    stmt = stmt.order_by(Property.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property_id)
    )
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.post("", response_model=PropertyOut, status_code=201)
async def create_property(
    data: PropertyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    prop = Property(**data.model_dump())
    db.add(prop)
    await db.commit()
    await db.refresh(prop, ["images"])
    return prop


@router.patch("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: UUID,
    data: PropertyUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)

    await db.commit()
    await db.refresh(prop, ["images"])
    return prop


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    await db.delete(prop)
    await db.commit()
