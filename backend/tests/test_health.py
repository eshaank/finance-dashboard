"""Tests for the /api/health endpoint."""

import httpx


async def test_health_returns_ok(authenticated_client: httpx.AsyncClient) -> None:
    response = await authenticated_client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
