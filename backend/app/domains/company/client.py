from dataclasses import dataclass

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_company_cache: TTLCache[str, "CompanyDetails"] = TTLCache(maxsize=128, ttl=300)


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
