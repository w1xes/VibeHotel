from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.profile import Profile
from app.schemas.auth import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    profile = await db.get(Profile, UUID(user["id"]))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=ProfileOut)
async def update_my_profile(
    data: ProfileUpdate,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    profile = await db.get(Profile, UUID(user["id"]))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("", response_model=list[ProfileOut])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    stmt = select(Profile).order_by(Profile.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
