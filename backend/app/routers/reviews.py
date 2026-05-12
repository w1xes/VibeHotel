from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.booking import Booking
from app.models.profile import Profile
from app.models.review import Review
from app.schemas.review import (
    PropertyRatingSummary,
    PropertyReviewsResponse,
    ReviewCreate,
    ReviewOut,
    ReviewUpdate,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _build_review_out(review: Review, user_name: str) -> dict:
    avg = round(
        (review.comfort + review.cleanliness + review.location + review.price) / 4, 1
    )
    return {
        "id": review.id,
        "booking_id": review.booking_id,
        "property_id": review.property_id,
        "user_id": review.user_id,
        "user_name": user_name,
        "comfort": review.comfort,
        "cleanliness": review.cleanliness,
        "location": review.location,
        "price": review.price,
        "avg_score": avg,
        "comment": review.comment,
        "created_at": review.created_at,
    }


def _compute_summary(review_dicts: list[dict]) -> PropertyRatingSummary:
    n = len(review_dicts)
    if n == 0:
        return PropertyRatingSummary(review_count=0)
    return PropertyRatingSummary(
        review_count=n,
        avg_rating=round(sum(r["avg_score"] for r in review_dicts) / n, 1),
        avg_comfort=round(sum(r["comfort"] for r in review_dicts) / n, 1),
        avg_cleanliness=round(sum(r["cleanliness"] for r in review_dicts) / n, 1),
        avg_location=round(sum(r["location"] for r in review_dicts) / n, 1),
        avg_price=round(sum(r["price"] for r in review_dicts) / n, 1),
    )


# ── GET /reviews/my  (must be defined before /{review_id}) ──────────────────

@router.get("/my", response_model=list[ReviewOut])
async def get_my_reviews(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(user["id"])
    stmt = (
        select(Review, Profile.name.label("user_name"))
        .join(Profile, Profile.id == Review.user_id)
        .where(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    return [_build_review_out(review, user_name) for review, user_name in rows]


# ── GET /reviews/property/{property_id} ─────────────────────────────────────

@router.get("/property/{property_id}", response_model=PropertyReviewsResponse)
async def get_property_reviews(
    property_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(Review, Profile.name.label("user_name"))
        .join(Profile, Profile.id == Review.user_id)
        .where(Review.property_id == property_id)
        .order_by(Review.created_at.desc())
    )
    rows = (await db.execute(stmt)).all()
    reviews = [_build_review_out(r, name) for r, name in rows]
    return {"reviews": reviews, "summary": _compute_summary(reviews)}


# ── POST /reviews ────────────────────────────────────────────────────────────

@router.post("", response_model=ReviewOut, status_code=201)
async def create_review(
    data: ReviewCreate,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(user["id"])

    booking = await db.get(Booking, data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "completed":
        raise HTTPException(
            status_code=400, detail="You can only review completed bookings"
        )

    existing = (
        await db.execute(select(Review).where(Review.booking_id == data.booking_id))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409, detail="You have already reviewed this booking"
        )

    review = Review(
        booking_id=data.booking_id,
        property_id=booking.property_id,
        user_id=user_id,
        comfort=data.comfort,
        cleanliness=data.cleanliness,
        location=data.location,
        price=data.price,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    profile = await db.get(Profile, user_id)
    return _build_review_out(review, profile.name if profile else "")


# ── PATCH /reviews/{review_id} ───────────────────────────────────────────────

@router.patch("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: UUID,
    data: ReviewUpdate,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(user["id"])
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your review")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(review, field, value)

    await db.commit()
    await db.refresh(review)

    profile = await db.get(Profile, user_id)
    return _build_review_out(review, profile.name if profile else "")


# ── DELETE /reviews/{review_id} ──────────────────────────────────────────────

@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: UUID,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(user["id"])
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your review")

    await db.delete(review)
    await db.commit()
