from uuid import UUID
from pydantic import BaseModel, field_validator


class PropertyImageOut(BaseModel):
    id: UUID
    url: str
    position: int

    model_config = {"from_attributes": True}


class PropertyOut(BaseModel):
    id: UUID
    title: str
    type: str
    description: str
    price: float
    capacity: int
    bedrooms: int
    bathrooms: int
    area: float | None = None
    amenities: list[str] = []
    featured: bool = False
    images: list[PropertyImageOut] = []

    model_config = {"from_attributes": True}

    @field_validator("price", "area", mode="before")
    @classmethod
    def coerce_decimal(cls, v):
        if v is not None:
            return float(v)
        return v


class PropertyCreate(BaseModel):
    title: str
    type: str
    description: str = ""
    price: float
    capacity: int
    bedrooms: int = 1
    bathrooms: int = 1
    area: float | None = None
    amenities: list[str] = []
    featured: bool = False

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v not in ("house", "suite", "room"):
            raise ValueError("type must be house, suite or room")
        return v


class PropertyUpdate(BaseModel):
    title: str | None = None
    type: str | None = None
    description: str | None = None
    price: float | None = None
    capacity: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    area: float | None = None
    amenities: list[str] | None = None
    featured: bool | None = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v is not None and v not in ("house", "suite", "room"):
            raise ValueError("type must be house, suite or room")
        return v
