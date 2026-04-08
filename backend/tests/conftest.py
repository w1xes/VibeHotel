"""
Shared fixtures and factories for VibeHotel backend tests.

Strategy:
- No real database or Supabase connection.  Everything is mocked via
  FastAPI dependency_overrides + unittest.mock.AsyncMock.
- SQLAlchemy ORM defaults (uuid4, datetime) only fire at INSERT time, so
  factory functions assign them at Python level so tests stay self-contained.
"""
import uuid
from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest
import httpx
from httpx import ASGITransport

from app.main import app
from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.booking import Booking
from app.models.profile import Profile
from app.models.property import Property, PropertyImage

# ---------------------------------------------------------------------------
# Stable UUIDs used across tests
# ---------------------------------------------------------------------------
USER_ID = uuid.UUID("aaaaaaaa-0000-0000-0000-000000000001")
ADMIN_ID = uuid.UUID("aaaaaaaa-0000-0000-0000-000000000002")
OTHER_USER_ID = uuid.UUID("aaaaaaaa-0000-0000-0000-000000000003")
PROP_ID = uuid.UUID("bbbbbbbb-0000-0000-0000-000000000001")
BOOKING_ID = uuid.UUID("cccccccc-0000-0000-0000-000000000001")

# ---------------------------------------------------------------------------
# Auth payload dicts (returned by get_current_user / require_admin overrides)
# ---------------------------------------------------------------------------
FAKE_USER = {"id": str(USER_ID), "name": "Test User", "role": "user", "avatar_url": None}
FAKE_ADMIN = {"id": str(ADMIN_ID), "name": "Admin User", "role": "admin", "avatar_url": None}

# ---------------------------------------------------------------------------
# Model factories
# ---------------------------------------------------------------------------

def make_property(**overrides) -> Property:
    prop = Property(
        id=PROP_ID,
        title="Test Villa",
        type="house",
        description="A nice place",
        price=Decimal("150.00"),
        capacity=4,
        bedrooms=2,
        bathrooms=1,
        area=Decimal("80.00"),
        amenities=["wifi"],
        featured=False,
        created_at=datetime(2024, 1, 1),
    )
    prop.images = []
    for key, value in overrides.items():
        setattr(prop, key, value)
    return prop


def make_property_image(**overrides) -> PropertyImage:
    img = PropertyImage(
        id=uuid.uuid4(),
        property_id=PROP_ID,
        url="https://example.com/img.jpg",
        position=0,
        created_at=datetime(2024, 1, 1),
    )
    for key, value in overrides.items():
        setattr(img, key, value)
    return img


def make_booking(**overrides) -> Booking:
    prop = make_property()
    booking = Booking(
        id=BOOKING_ID,
        user_id=USER_ID,
        property_id=PROP_ID,
        check_in=date(2024, 8, 1),
        check_out=date(2024, 8, 3),  # 2 nights → total 300.00
        guests=2,
        total_price=Decimal("300.00"),
        status="confirmed",
        created_at=datetime(2024, 1, 1),
    )
    booking.property = prop
    for key, value in overrides.items():
        setattr(booking, key, value)
    return booking


def make_profile(**overrides) -> Profile:
    profile = Profile(
        id=USER_ID,
        name="Test User",
        role="user",
        avatar_url=None,
        created_at=datetime(2024, 1, 1),
    )
    for key, value in overrides.items():
        setattr(profile, key, value)
    return profile


# ---------------------------------------------------------------------------
# Mock SQLAlchemy execute result helper
# ---------------------------------------------------------------------------

def stub_result(
    items=None,
    scalar_one=None,
    scalar_one_or_none=None,
):
    """
    Build a MagicMock that covers every SQLAlchemy AsyncResult chain
    pattern used in the routers:

      result.scalars().unique().all()   — list endpoints (properties, bookings)
      result.scalars().all()            — users list
      result.scalar_one()               — single-object refetch after write
      result.scalar_one_or_none()       — GET single property
    """
    result = MagicMock()

    # .scalar_one() / .scalar_one_or_none() — direct on result
    result.scalar_one.return_value = scalar_one
    result.scalar_one_or_none.return_value = scalar_one_or_none

    # .scalars().all()
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = items or []

    # .scalars().unique().all()
    unique_mock = MagicMock()
    unique_mock.all.return_value = items or []
    scalars_mock.unique.return_value = unique_mock

    result.scalars.return_value = scalars_mock
    return result


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def clear_overrides():
    """Ensure dependency_overrides are clean before and after every test."""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_db():
    """
    Async mock SQLAlchemy session wired into the app via dependency override.

    Key behaviours reproduced:
    - session.add(obj): assigns id + created_at when missing
      (SQLAlchemy column defaults only run at real INSERT flush time).
    - session.refresh(obj, attrs): sets obj.images = [] when "images" in attrs.
    - session.get(Model, pk): returns None by default; override per-test with
      mock_db.get.return_value = make_xxx().
    - session.execute(stmt): returns None by default; override per-test with
      mock_db.execute.return_value = stub_result(...).
    """
    session = AsyncMock()

    def _add(obj):
        if getattr(obj, "id", None) is None:
            obj.id = uuid.uuid4()
        if getattr(obj, "created_at", None) is None:
            obj.created_at = datetime.now()

    session.add = MagicMock(side_effect=_add)

    async def _refresh(obj, attrs=None):
        if attrs and "images" in attrs:
            obj.images = []

    session.refresh.side_effect = _refresh

    async def _override():
        yield session

    app.dependency_overrides[get_db] = _override
    return session


@pytest.fixture
async def anon_client():
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


@pytest.fixture
async def user_client(mock_db):
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


@pytest.fixture
async def admin_client(mock_db):
    app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
    app.dependency_overrides[require_admin] = lambda: FAKE_ADMIN
    async with httpx.AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client
