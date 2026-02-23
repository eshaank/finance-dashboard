"""Tests for the economics service orchestrator."""

from unittest.mock import AsyncMock, patch

import httpx

from app.domains.economics.schemas import EconomicDataPoint
from app.domains.economics.service import _derive_status, get_economic_data

MOCK_FRED_POINTS = [
    EconomicDataPoint(
        id="fred-gdp", indicator="US GDP (Quarterly)", country="US",
        previous=25000.0, forecast=None, actual=25500.0,
        status="beat", date="2026-01-01", unit="B",
    ),
]

MOCK_MASSIVE_INFLATION = [
    {
        "date": "2026-01-01", "cpi": 3.1, "cpi_core": 3.5,
        "cpi_year_over_year": 2.9, "pce": 2.8, "pce_core": 2.7, "pce_spending": 1.2,
    },
    {
        "date": "2025-12-01", "cpi": 3.0, "cpi_core": 3.4,
        "cpi_year_over_year": 2.8, "pce": 2.7, "pce_core": 2.6, "pce_spending": 1.1,
    },
]

MOCK_MASSIVE_YIELDS = [
    {"date": "2026-01-15", "yield_2_year": 4.2, "yield_10_year": 4.5, "yield_30_year": 4.7},
    {"date": "2026-01-14", "yield_2_year": 4.1, "yield_10_year": 4.4, "yield_30_year": 4.6},
]

MOCK_MASSIVE_EXPECTATIONS = [
    {"date": "2026-01-15", "market_5_year": 2.3, "market_10_year": 2.4},
    {"date": "2026-01-14", "market_5_year": 2.2, "market_10_year": 2.3},
]

MOCK_MASSIVE_LABOR = [
    {"date": "2026-01-01", "unemployment_rate": 3.7, "labor_force_participation_rate": 62.5, "job_openings": 8800},
    {"date": "2025-12-01", "unemployment_rate": 3.8, "labor_force_participation_rate": 62.4, "job_openings": 8700},
]


async def test_get_economic_data_merges_fred_and_massive() -> None:
    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.economics.service.get_fred_economic_data",
        new_callable=AsyncMock,
        return_value=MOCK_FRED_POINTS,
    ), patch(
        "app.domains.economics.client.get_inflation",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_INFLATION,
    ), patch(
        "app.domains.economics.client.get_treasury_yields",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_YIELDS,
    ), patch(
        "app.domains.economics.client.get_inflation_expectations",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_EXPECTATIONS,
    ), patch(
        "app.domains.economics.client.get_labor_market",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_LABOR,
    ):
        result = await get_economic_data(client)

    assert len(result) > 1
    ids = [p.id for p in result]
    assert "fred-gdp" in ids
    assert "massive-cpi" in ids
    assert "massive-t10y" in ids
    assert "massive-unemp" in ids

    # Verify sorted by date descending
    dates = [p.date for p in result]
    assert dates == sorted(dates, reverse=True)


async def test_graceful_degradation_fred_failure() -> None:
    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.economics.service.get_fred_economic_data",
        new_callable=AsyncMock,
        side_effect=RuntimeError("FRED down"),
    ), patch(
        "app.domains.economics.client.get_inflation",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_INFLATION,
    ), patch(
        "app.domains.economics.client.get_treasury_yields",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_YIELDS,
    ), patch(
        "app.domains.economics.client.get_inflation_expectations",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_EXPECTATIONS,
    ), patch(
        "app.domains.economics.client.get_labor_market",
        new_callable=AsyncMock,
        return_value=MOCK_MASSIVE_LABOR,
    ):
        result = await get_economic_data(client)

    assert len(result) > 0
    assert all(p.id.startswith("massive-") for p in result)


async def test_graceful_degradation_massive_failure() -> None:
    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.economics.service.get_fred_economic_data",
        new_callable=AsyncMock,
        return_value=MOCK_FRED_POINTS,
    ), patch(
        "app.domains.economics.service._get_massive_economic_data",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Massive down"),
    ):
        result = await get_economic_data(client)

    assert len(result) == 1
    assert result[0].id == "fred-gdp"


def test_derive_status() -> None:
    assert _derive_status(3.5, 3.4) == "beat"
    assert _derive_status(3.4, 3.5) == "missed"
    assert _derive_status(3.5, 3.5) == "inline"
    assert _derive_status(None, 3.5) == "pending"
    assert _derive_status(3.5, None) == "pending"
