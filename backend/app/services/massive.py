import httpx

from app.config import settings


def _key() -> str:
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")
    return settings.massive_api_key


def _get(path: str, params: dict) -> list[dict]:
    params["apiKey"] = _key()
    url = f"{settings.massive_base_url}{path}"
    resp = httpx.get(url, params=params, timeout=10.0)
    resp.raise_for_status()
    return resp.json().get("results", [])


def get_balance_sheet(ticker: str) -> list[dict]:
    return _get(
        "/stocks/financials/v1/balance-sheets",
        {"tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc"},
    )


def get_cash_flow(ticker: str) -> list[dict]:
    return _get(
        "/stocks/financials/v1/cash-flow-statements",
        {"tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc"},
    )


def get_income_statement(ticker: str) -> list[dict]:
    return _get(
        "/stocks/financials/v1/income-statements",
        {"tickers": ticker.upper(), "limit": 50, "sort": "period_end.desc"},
    )


def get_ratios(ticker: str) -> list[dict]:
    return _get(
        "/stocks/financials/v1/ratios",
        {"ticker": ticker.upper(), "limit": 20, "sort": "date.asc"},
    )


def get_short_interest(ticker: str) -> list[dict]:
    return _get(
        "/stocks/v1/short-interest",
        {"ticker": ticker.upper(), "limit": 50, "sort": "settlement_date.asc"},
    )


def get_short_volume(ticker: str) -> list[dict]:
    return _get(
        "/stocks/v1/short-volume",
        {"ticker": ticker.upper(), "limit": 50, "sort": "date.asc"},
    )


def get_float(ticker: str) -> dict | None:
    results = _get(
        "/stocks/vX/float",
        {"ticker": ticker.upper(), "limit": 1},
    )
    return results[0] if results else None
