from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    booking_id: UUID
    comfort: int
    cleanliness: int
    location: int
    price: int
    comment: str | None = None

    @field_validator("comfort", "cleanliness", "location", "price")
    @classmethod
    def validate_score(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("Score must be between 1 and 5")
        return v


class ReviewUpdate(BaseModel):
    comfort: int | None = None
    cleanliness: int | None = None
    location: int | None = None
    price: int | None = None
    comment: str | None = None

    @field_validator("comfort", "cleanliness", "location", "price", mode="before")
    @classmethod
    def validate_score_optional(cls, v):
        if v is not None and not (1 <= int(v) <= 5):
            raise ValueError("Score must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: UUID
    booking_id: UUID
    property_id: UUID
    user_id: UUID
    user_name: str
    comfort: int
    cleanliness: int
    location: int
    price: int
    avg_score: float
    comment: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PropertyRatingSummary(BaseModel):
    review_count: int = 0
    avg_rating: float | None = None
    avg_comfort: float | None = None
    avg_cleanliness: float | None = None
    avg_location: float | None = None
    avg_price: float | None = None


class PropertyReviewsResponse(BaseModel):
    reviews: list[ReviewOut]
    summary: PropertyRatingSummary
