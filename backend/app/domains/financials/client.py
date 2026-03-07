import httpx

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry


async def _get(client: httpx.AsyncClient, path: str, params: dict) -> list[dict]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")
    params["apiKey"] = settings.massive_api_key
    url = f"{settings.massive_base_url}{path}"
    response = await fetch_with_retry(client, "GET", url, params=params)
    return response.json().get("results", [])


async def get_balance_sheet(client: httpx.AsyncClient, ticker: str) -> list[dict]:
    return await _get(client, "/stocks/financials/v1/balance-sheets", {
        "tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc",
    })


async def get_cash_flow(client: httpx.AsyncClient, ticker: str) -> list[dict]:
    return await _get(client, "/stocks/financials/v1/cash-flow-statements", {
        "tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc",
    })


async def get_income_statement(client: httpx.AsyncClient, ticker: str) -> list[dict]:
    return await _get(client, "/stocks/financials/v1/income-statements", {
        "tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc",
    })


async def get_ratios(client: httpx.AsyncClient, ticker: str) -> list[dict]:
    return await _get(client, "/stocks/financials/v1/ratios", {
        "ticker": ticker.upper(), "limit": 20, "sort": "date.asc",
    })
