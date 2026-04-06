from uuid import UUID
from pydantic import BaseModel


class ProfileOut(BaseModel):
    id: UUID
    name: str
    role: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
