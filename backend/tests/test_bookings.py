"""
Route tests for /api/bookings.

Booking creation calculates total_price = property.price × nights server-side.
The mock_db.get() is used to look up the property and (optionally) the booking.
POST /bookings reads property via db.get(Property, id) then inserts a Booking.
After INSERT the router re-fetches via db.execute → stub_result(scalar_one=...).
"""
import uuid
from decimal import Decimal

import pytest

from tests.conftest import (
    BOOKING_ID,
    OTHER_USER_ID,
    PROP_ID,
    USER_ID,
    make_booking,
    make_property,
    stub_result,
)

# ---------------------------------------------------------------------------
# GET /api/bookings/me  (authenticated user)
# ---------------------------------------------------------------------------

async def test_get_my_bookings_returns_200(user_client, mock_db):
    booking = make_booking()
    mock_db.execute.return_value = stub_result(items=[booking])
    response = await user_client.get("/api/bookings/me")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == str(BOOKING_ID)


async def test_get_my_bookings_requires_auth(anon_client):
    response = await anon_client.get("/api/bookings/me")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /api/bookings
# ---------------------------------------------------------------------------

VALID_BOOKING_BODY = {
    "property_id": str(PROP_ID),
    "check_in": "2024-08-01",
    "check_out": "2024-08-03",  # 2 nights
    "guests": 2,
}


async def test_create_booking_returns_201_with_correct_price(user_client, mock_db):
    prop = make_property(price=Decimal("150.00"), capacity=4)
    mock_db.get.return_value = prop

    # After the INSERT, the router re-fetches via db.execute().scalar_one()
    created_booking = make_booking(total_price=Decimal("300.00"))
    mock_db.execute.return_value = stub_result(scalar_one=created_booking)

    response = await user_client.post("/api/bookings", json=VALID_BOOKING_BODY)
    assert response.status_code == 201
    data = response.json()
    assert data["total_price"] == 300.0   # 2 nights × 150.00


async def test_create_booking_guests_exceed_capacity(user_client, mock_db):
    prop = make_property(capacity=2)
    mock_db.get.return_value = prop
    body = {**VALID_BOOKING_BODY, "guests": 5}
    response = await user_client.post("/api/bookings", json=body)
    assert response.status_code == 400
    assert "capacity" in response.json()["detail"].lower()


async def test_create_booking_check_out_before_check_in_returns_422(user_client, mock_db):
    body = {**VALID_BOOKING_BODY, "check_out": "2024-07-31"}
    response = await user_client.post("/api/bookings", json=body)
    assert response.status_code == 422


async def test_create_booking_same_day_returns_422(user_client, mock_db):
    body = {**VALID_BOOKING_BODY, "check_out": "2024-08-01"}
    response = await user_client.post("/api/bookings", json=body)
    assert response.status_code == 422


async def test_create_booking_requires_auth(anon_client):
    response = await anon_client.post("/api/bookings", json=VALID_BOOKING_BODY)
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# PATCH /api/bookings/{id}/cancel
# ---------------------------------------------------------------------------

async def test_cancel_own_booking_returns_200(user_client, mock_db):
    booking = make_booking(user_id=USER_ID, status="confirmed")
    mock_db.get.return_value = booking
    # Router re-fetches after status change
    mock_db.execute.return_value = stub_result(
        scalar_one=make_booking(user_id=USER_ID, status="cancelled")
    )
    response = await user_client.patch(f"/api/bookings/{BOOKING_ID}/cancel")
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


async def test_cancel_other_users_booking_returns_403(user_client, mock_db):
    # Booking belongs to a different user
    booking = make_booking(user_id=OTHER_USER_ID, status="confirmed")
    mock_db.get.return_value = booking
    response = await user_client.patch(f"/api/bookings/{BOOKING_ID}/cancel")
    assert response.status_code == 403


async def test_cancel_already_cancelled_returns_400(user_client, mock_db):
    booking = make_booking(user_id=USER_ID, status="cancelled")
    mock_db.get.return_value = booking
    response = await user_client.patch(f"/api/bookings/{BOOKING_ID}/cancel")
    assert response.status_code == 400


async def test_cancel_booking_not_found(user_client, mock_db):
    mock_db.get.return_value = None
    response = await user_client.patch(f"/api/bookings/{uuid.uuid4()}/cancel")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# GET /api/bookings  (admin only)
# ---------------------------------------------------------------------------

async def test_get_all_bookings_as_admin(admin_client, mock_db):
    mock_db.execute.return_value = stub_result(items=[make_booking()])
    response = await admin_client.get("/api/bookings")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_all_bookings_requires_admin(user_client, mock_db):
    response = await user_client.get("/api/bookings")
    assert response.status_code == 403


# ---------------------------------------------------------------------------
# PATCH /api/bookings/{id}/status  (admin only)
# ---------------------------------------------------------------------------

async def test_update_booking_status_returns_200(admin_client, mock_db):
    booking = make_booking(status="confirmed")
    mock_db.get.return_value = booking
    mock_db.execute.return_value = stub_result(
        scalar_one=make_booking(status="completed")
    )
    response = await admin_client.patch(
        f"/api/bookings/{BOOKING_ID}/status",
        json={"status": "completed"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"


async def test_update_booking_status_not_found(admin_client, mock_db):
    mock_db.get.return_value = None
    response = await admin_client.patch(
        f"/api/bookings/{uuid.uuid4()}/status",
        json={"status": "completed"},
    )
    assert response.status_code == 404
