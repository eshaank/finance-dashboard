"""Shared fixtures for the backend test suite."""

from collections.abc import AsyncIterator
from unittest.mock import AsyncMock

import httpx
import pytest
from httpx import ASGITransport

from app.core.security import get_current_user
from app.main import app

FAKE_USER: dict = {
    "sub": "test-user-id-000",
    "email": "test@example.com",
    "aud": "authenticated",
    "role": "authenticated",
}


def _mock_get_current_user() -> dict:
    """Return a fake JWT payload so tests skip real auth."""
    return FAKE_USER


@pytest.fixture()
async def authenticated_client() -> AsyncIterator[httpx.AsyncClient]:
    """Async test client with auth dependency overridden."""
    app.dependency_overrides[get_current_user] = _mock_get_current_user

    # Provide a mock http_client on app.state so lifespan is not needed
    mock_http = AsyncMock(spec=httpx.AsyncClient)
    app.state.http_client = mock_http

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture()
async def unauthenticated_client() -> AsyncIterator[httpx.AsyncClient]:
    """Async test client with NO auth override (real security applies)."""
    mock_http = AsyncMock(spec=httpx.AsyncClient)
    app.state.http_client = mock_http

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
