from uuid import UUID
from datetime import date
from pydantic import BaseModel, field_validator

from app.schemas.property import PropertyOut


class BookingCreate(BaseModel):
    property_id: UUID
    check_in: date
    check_out: date
    guests: int

    @field_validator("check_out")
    @classmethod
    def check_out_after_check_in(cls, v, info):
        check_in = info.data.get("check_in")
        if check_in and v <= check_in:
            raise ValueError("check_out must be after check_in")
        return v

    @field_validator("guests")
    @classmethod
    def guests_positive(cls, v):
        if v < 1:
            raise ValueError("guests must be at least 1")
        return v


class BookingOut(BaseModel):
    id: UUID
    user_id: UUID
    property_id: UUID
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str
    created_at: str
    property: PropertyOut | None = None

    model_config = {"from_attributes": True}

    @field_validator("total_price", mode="before")
    @classmethod
    def coerce_decimal(cls, v):
        if v is not None:
            return float(v)
        return v

    @field_validator("created_at", mode="before")
    @classmethod
    def format_datetime(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)


class BookingStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in ("confirmed", "completed", "cancelled"):
            raise ValueError("status must be confirmed, completed or cancelled")
        return v
