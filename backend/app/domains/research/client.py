from dataclasses import dataclass
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_company_cache: TTLCache[str, "CompanyDetails"] = TTLCache(maxsize=128, ttl=300)
_dividend_cache: TTLCache[str, list["DividendInfo"]] = TTLCache(maxsize=128, ttl=300)
_split_cache: TTLCache[str, list["SplitInfo"]] = TTLCache(maxsize=128, ttl=300)


@dataclass
class CompanyDetails:
    ticker: str
    name: str
    description: str
    sic_description: str
    primary_exchange: str
    homepage_url: str | None
    total_employees: int | None
    market_cap: float | None
    logo_url: str | None


@dataclass
class DividendInfo:
    ticker: str
    ex_date: str
    record_date: str | None
    pay_date: str | None
    declaration_date: str | None
    amount: float
    frequency: int | None


@dataclass
class SplitInfo:
    ticker: str
    execution_date: str
    split_from: int
    split_to: int


async def fetch_company_details(client: httpx.AsyncClient, ticker: str) -> CompanyDetails:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    ticker_upper = ticker.upper()
    if ticker_upper in _company_cache:
        return _company_cache[ticker_upper]

    url = f"https://api.polygon.io/v3/reference/tickers/{ticker_upper}"
    params = {"apiKey": settings.massive_api_key}

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No company data found for ticker '{ticker}'")

    r = results
    branding = r.get("branding") or {}
    logo_url: str | None = None
    if branding.get("logo_url"):
        logo_url = f"{branding['logo_url']}?apiKey={settings.massive_api_key}"

    details = CompanyDetails(
        ticker=r.get("ticker", ticker_upper),
        name=r.get("name", ""),
        description=r.get("description", ""),
        sic_description=r.get("sic_description", ""),
        primary_exchange=r.get("primary_exchange", ""),
        homepage_url=r.get("homepage_url"),
        total_employees=r.get("total_employees"),
        market_cap=r.get("market_cap"),
        logo_url=logo_url,
    )
    _company_cache[ticker_upper] = details
    return details


async def fetch_dividend_history(client: httpx.AsyncClient, ticker: str) -> list[DividendInfo]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    ticker_upper = ticker.upper()
    if ticker_upper in _dividend_cache:
        return _dividend_cache[ticker_upper]

    to_date = date.today()
    from_date = to_date - timedelta(days=365 * 5)

    url = f"https://api.polygon.io/v3/reference/dividends"
    params = {
        "ticker": ticker_upper,
        "ex_dividend_date.gte": from_date.isoformat(),
        "ex_dividend_date.lte": to_date.isoformat(),
        "limit": 1000,
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])

    dividend_list: list[DividendInfo] = []
    for r in results:
        dividend_info = DividendInfo(
            ticker=r.get("ticker", ticker_upper),
            ex_date=r.get("ex_dividend_date", ""),
            record_date=r.get("record_date"),
            pay_date=r.get("pay_date"),
            declaration_date=r.get("declaration_date"),
            amount=float(r.get("cash_amount", 0)),
            frequency=r.get("frequency"),
        )
        dividend_list.append(dividend_info)

    _dividend_cache[ticker_upper] = dividend_list
    return dividend_list


async def fetch_split_history(client: httpx.AsyncClient, ticker: str) -> list[SplitInfo]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    ticker_upper = ticker.upper()
    if ticker_upper in _split_cache:
        return _split_cache[ticker_upper]

    to_date = date.today()
    from_date = to_date - timedelta(days=365 * 5)

    url = f"https://api.polygon.io/v3/reference/splits"
    params = {
        "ticker": ticker_upper,
        "execution_date.gte": from_date.isoformat(),
        "execution_date.lte": to_date.isoformat(),
        "limit": 1000,
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])

    split_list: list[SplitInfo] = []
    for r in results:
        split_info = SplitInfo(
            ticker=r.get("ticker", ticker_upper),
            execution_date=r.get("execution_date", ""),
            split_from=r.get("split_from", 1),
            split_to=r.get("split_to", 1),
        )
        split_list.append(split_info)

    _split_cache[ticker_upper] = split_list
    return split_list
