"""Tests for the economics router endpoints."""

from unittest.mock import AsyncMock, patch

import httpx

from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent

MOCK_DATA = [
    EconomicDataPoint(
        id="fred-gdp", indicator="US GDP (Quarterly)", country="US",
        previous=25000.0, forecast=None, actual=25500.0,
        status="beat", date="2026-01-01", unit="B",
    ),
]

MOCK_EVENTS = [
    UpcomingEvent(
        id="fred-release-10", name="Employment Situation",
        datetime="2026-03-07T12:00:00Z", priority="HIGH",
        category="employment", daysUntil=14,
    ),
]


async def test_economic_data_endpoint_200(
    authenticated_client: httpx.AsyncClient,
) -> None:
    with patch(
        "app.domains.economics.router.get_economic_data",
        new_callable=AsyncMock,
        return_value=MOCK_DATA,
    ):
        response = await authenticated_client.get("/api/v1/economic-data")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == "fred-gdp"
    assert body[0]["indicator"] == "US GDP (Quarterly)"
    assert body[0]["actual"] == 25500.0
    assert body[0]["status"] == "beat"


async def test_upcoming_events_endpoint_200(
    authenticated_client: httpx.AsyncClient,
) -> None:
    with patch(
        "app.domains.economics.router.get_upcoming_events",
        new_callable=AsyncMock,
        return_value=MOCK_EVENTS,
    ):
        response = await authenticated_client.get("/api/v1/upcoming-events")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == "fred-release-10"
    assert body[0]["name"] == "Employment Situation"
    assert body[0]["priority"] == "HIGH"


async def test_economic_data_returns_502_on_external_failure(
    authenticated_client: httpx.AsyncClient,
) -> None:
    with patch(
        "app.domains.economics.router.get_economic_data",
        new_callable=AsyncMock,
        side_effect=RuntimeError("API down"),
    ):
        response = await authenticated_client.get("/api/v1/economic-data")

    assert response.status_code == 502
    assert response.json()["detail"] == "External API error"


async def test_economic_data_returns_400_on_missing_key(
    authenticated_client: httpx.AsyncClient,
) -> None:
    with patch(
        "app.domains.economics.router.get_economic_data",
        new_callable=AsyncMock,
        side_effect=ValueError("FRED_API_KEY is not configured"),
    ):
        response = await authenticated_client.get("/api/v1/economic-data")

    assert response.status_code == 400
    assert "FRED_API_KEY" in response.json()["detail"]
