import re
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import require_admin
from app.models.property import Property, PropertyImage
from app.models.review import Review
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


def _slugify(text: str) -> str:
    """Convert a title to a URL-safe slug, e.g. 'Lakeside Cottage' → 'lakeside-cottage'."""
    slug = text.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


async def _attach_ratings(db: AsyncSession, props: list) -> None:
    """Attach avg_rating and review_count to each property in-place."""
    if not props:
        return
    prop_ids = [p.id for p in props]
    stmt = (
        select(
            Review.property_id,
            func.count(Review.id).label("review_count"),
            func.avg(Review.comfort).label("avg_comfort"),
            func.avg(Review.cleanliness).label("avg_cleanliness"),
            func.avg(Review.location).label("avg_location"),
            func.avg(Review.price).label("avg_price"),
        )
        .where(Review.property_id.in_(prop_ids))
        .group_by(Review.property_id)
    )
    result = await db.execute(stmt)
    rating_map: dict = {}
    for row in result:
        avg = (
            float(row.avg_comfort)
            + float(row.avg_cleanliness)
            + float(row.avg_location)
            + float(row.avg_price)
        ) / 4
        rating_map[row.property_id] = {
            "avg_rating": round(avg, 1),
            "review_count": row.review_count,
        }
    for p in props:
        r = rating_map.get(p.id)
        p.avg_rating = r["avg_rating"] if r else None
        p.review_count = r["review_count"] if r else 0


@router.get("", response_model=list[PropertyOut])
async def list_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    type: str | None = Query(None),
    min_capacity: int | None = Query(None),
    max_price: float | None = Query(None),
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
    props = result.scalars().unique().all()
    await _attach_ratings(db, list(props))
    return props


@router.get("/{property_ref}", response_model=PropertyOut)
async def get_property(
    property_ref: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Accept either a UUID or a slug."""
    try:
        property_id = UUID(property_ref)
        stmt = (
            select(Property)
            .options(selectinload(Property.images))
            .where(Property.id == property_id)
        )
    except ValueError:
        stmt = (
            select(Property)
            .options(selectinload(Property.images))
            .where(Property.slug == property_ref)
        )
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    await _attach_ratings(db, [prop])
    return prop


@router.post("", response_model=PropertyOut, status_code=201)
async def create_property(
    data: PropertyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[dict, Depends(require_admin)],
):
    payload = data.model_dump()
    if not payload.get("slug"):
        payload["slug"] = _slugify(payload["title"])
    prop = Property(**payload)
    db.add(prop)
    await db.commit()
    await db.refresh(prop, ["images"])
    await _attach_ratings(db, [prop])
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
    await _attach_ratings(db, [prop])
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
