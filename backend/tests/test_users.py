"""
Route tests for /api/users.
"""
import uuid

import pytest

from app.deps import require_admin
from app.main import app
from tests.conftest import USER_ID, make_profile, stub_result


# ---------------------------------------------------------------------------
# GET /api/users/me
# ---------------------------------------------------------------------------

async def test_get_my_profile_returns_200(user_client, mock_db):
    mock_db.get.return_value = make_profile()
    response = await user_client.get("/api/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(USER_ID)
    assert data["name"] == "Test User"
    assert data["role"] == "user"


async def test_get_my_profile_requires_auth(anon_client):
    response = await anon_client.get("/api/users/me")
    assert response.status_code == 401


async def test_get_my_profile_not_found(user_client, mock_db):
    mock_db.get.return_value = None
    response = await user_client.get("/api/users/me")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# PATCH /api/users/me
# ---------------------------------------------------------------------------

async def test_update_my_profile_returns_200(user_client, mock_db):
    profile = make_profile()
    mock_db.get.return_value = profile
    response = await user_client.patch("/api/users/me", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


async def test_update_my_profile_no_change_is_ok(user_client, mock_db):
    mock_db.get.return_value = make_profile()
    response = await user_client.patch("/api/users/me", json={})
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# GET /api/users   (admin only)
# ---------------------------------------------------------------------------

async def test_list_users_as_admin_returns_200(admin_client, mock_db):
    mock_db.execute.return_value = stub_result(items=[make_profile()])
    response = await admin_client.get("/api/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


async def test_list_users_as_regular_user_returns_403(user_client, mock_db):
    # user_client only overrides get_current_user, not require_admin —
    # the real require_admin dependency will call get_current_user and
    # see role="user", returning 403.
    response = await user_client.get("/api/users")
    assert response.status_code == 403
