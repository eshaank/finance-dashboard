"""Tests that protected endpoints reject unauthenticated requests."""

import httpx


async def test_market_indices_requires_auth(unauthenticated_client: httpx.AsyncClient) -> None:
    """GET /api/v1/market-indices without a Bearer token must be rejected."""
    response = await unauthenticated_client.get("/api/v1/market-indices")

    # FastAPI's HTTPBearer returns 403 for missing credentials by default,
    # but the app may return 401 depending on middleware configuration.
    assert response.status_code in (401, 403)
