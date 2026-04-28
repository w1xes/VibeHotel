from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client

from app.config import get_settings
from app.database import get_db
from app.deps import require_admin
from app.models.property import Property, PropertyImage
from app.schemas.property import PropertyImageOut

router = APIRouter(prefix="/properties/{property_id}/images", tags=["storage"])

BUCKET = "property-images"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _get_supabase():
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.post("", response_model=PropertyImageOut, status_code=201)
async def upload_image(
    property_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
    file: UploadFile = File(...),
    position: int = Form(0),
):
    # Verify property exists
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, WebP or GIF.",
        )

    # Read file content
    content = await file.read()
    # Limit to 5MB
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Generate filename: properties/{property_id}/{position:02d}.{ext}
    # If a file at that position already exists it will be overwritten, which
    # is the desired behaviour for a replace-in-place admin upload.
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg").lower()
    filename = f"properties/{property_id}/{position:02d}.{ext}"

    # Upload to Supabase Storage
    sb = _get_supabase()
    sb.storage.from_(BUCKET).upload(
        filename,
        content,
        {"content-type": file.content_type},
    )

    # Get public URL
    public_url = sb.storage.from_(BUCKET).get_public_url(filename)

    # Save to DB
    img = PropertyImage(
        property_id=property_id,
        url=public_url,
        position=position,
    )
    db.add(img)
    await db.commit()
    await db.refresh(img)

    return img


@router.delete("/{image_id}", status_code=204)
async def delete_image(
    property_id: UUID,
    image_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    stmt = select(PropertyImage).where(
        PropertyImage.id == image_id,
        PropertyImage.property_id == property_id,
    )
    result = await db.execute(stmt)
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # Try to remove from storage (best effort)
    try:
        sb = _get_supabase()
        # Extract path from URL
        path = img.url.split(f"{BUCKET}/")[1] if BUCKET in img.url else None
        if path:
            sb.storage.from_(BUCKET).remove([path])
    except Exception:
        pass  # Storage deletion is best-effort

    await db.delete(img)
    await db.commit()
