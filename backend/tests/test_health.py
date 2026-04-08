"""Tests for the /api/health endpoint."""


async def test_health_returns_ok(anon_client):
    response = await anon_client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
