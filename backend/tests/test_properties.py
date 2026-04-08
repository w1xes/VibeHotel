"""
Route tests for /api/properties.

All DB calls are mocked via the mock_db fixture (see conftest.py).
admin_client overrides both get_current_user and require_admin.
"""
import uuid

import pytest

from tests.conftest import PROP_ID, make_property, stub_result


# ---------------------------------------------------------------------------
# GET /api/properties
# ---------------------------------------------------------------------------

async def test_list_properties_returns_200(anon_client, mock_db):
    mock_db.execute.return_value = stub_result(items=[make_property()])
    response = await anon_client.get("/api/properties")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "Test Villa"


async def test_list_properties_empty(anon_client, mock_db):
    mock_db.execute.return_value = stub_result(items=[])
    response = await anon_client.get("/api/properties")
    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# GET /api/properties/{id}
# ---------------------------------------------------------------------------

async def test_get_property_returns_200(anon_client, mock_db):
    mock_db.execute.return_value = stub_result(scalar_one_or_none=make_property())
    response = await anon_client.get(f"/api/properties/{PROP_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(PROP_ID)
    assert data["title"] == "Test Villa"


async def test_get_property_not_found(anon_client, mock_db):
    mock_db.execute.return_value = stub_result(scalar_one_or_none=None)
    response = await anon_client.get(f"/api/properties/{uuid.uuid4()}")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/properties  (admin only)
# ---------------------------------------------------------------------------

VALID_CREATE_BODY = {
    "title": "New House",
    "type": "house",
    "description": "Nice",
    "price": 200.0,
    "capacity": 6,
    "bedrooms": 3,
    "bathrooms": 2,
}


async def test_create_property_requires_auth(anon_client):
    response = await anon_client.post("/api/properties", json=VALID_CREATE_BODY)
    assert response.status_code == 401


async def test_create_property_as_admin_returns_201(admin_client, mock_db):
    # After add+commit, the router calls refresh(prop, ["images"]) — conftest handles this.
    response = await admin_client.post("/api/properties", json=VALID_CREATE_BODY)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New House"
    assert data["type"] == "house"
    assert data["images"] == []


async def test_create_property_invalid_type_returns_422(admin_client, mock_db):
    body = {**VALID_CREATE_BODY, "type": "villa"}
    response = await admin_client.post("/api/properties", json=body)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# PATCH /api/properties/{id}  (admin only)
# ---------------------------------------------------------------------------

async def test_update_property_returns_200(admin_client, mock_db):
    prop = make_property()
    mock_db.get.return_value = prop
    # After commit, router calls refresh(prop, ["images"]); conftest assigns images=[].
    response = await admin_client.patch(
        f"/api/properties/{PROP_ID}", json={"title": "Updated Title"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


async def test_update_property_not_found(admin_client, mock_db):
    mock_db.get.return_value = None
    response = await admin_client.patch(
        f"/api/properties/{uuid.uuid4()}", json={"title": "X"}
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/properties/{id}  (admin only)
# ---------------------------------------------------------------------------

async def test_delete_property_returns_204(admin_client, mock_db):
    mock_db.get.return_value = make_property()
    response = await admin_client.delete(f"/api/properties/{PROP_ID}")
    assert response.status_code == 204


async def test_delete_property_not_found(admin_client, mock_db):
    mock_db.get.return_value = None
    response = await admin_client.delete(f"/api/properties/{uuid.uuid4()}")
    assert response.status_code == 404
