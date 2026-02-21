"""Tests for the fundamentals router with mocked service calls."""

from unittest.mock import AsyncMock, patch

import httpx


MOCK_BALANCE_SHEET_RAW = [
    {
        "period_end": "2024-12-31",
        "tickers": ["AAPL"],
        "timeframe": "annual",
        "fiscal_year": 2024,
        "fiscal_quarter": None,
        "total_assets": 352_583_000_000,
        "total_liabilities": 290_437_000_000,
        "total_equity": 62_146_000_000,
        "cash_and_equivalents": 29_965_000_000,
        "long_term_debt_and_capital_lease_obligations": 98_071_000_000,
    },
]


async def test_balance_sheet_returns_mocked_data(
    authenticated_client: httpx.AsyncClient,
) -> None:
    """GET /api/v1/fundamentals/balance-sheet returns 200 with mocked upstream data."""
    with patch(
        "app.domains.fundamentals.router.fetch_and_parse",
        new_callable=AsyncMock,
    ) as mock_fetch:
        from app.domains.fundamentals.schemas import BalanceSheetEntry

        mock_fetch.return_value = [BalanceSheetEntry(**r) for r in MOCK_BALANCE_SHEET_RAW]

        response = await authenticated_client.get(
            "/api/v1/fundamentals/balance-sheet",
            params={"ticker": "AAPL"},
        )

    assert response.status_code == 200

    body = response.json()
    assert len(body) == 1
    assert body[0]["period_end"] == "2024-12-31"
    assert body[0]["total_assets"] == 352_583_000_000
