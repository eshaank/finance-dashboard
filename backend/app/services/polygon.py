from dataclasses import dataclass
from datetime import date, timedelta

import httpx

from app.config import settings


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


def fetch_company_details(ticker: str) -> CompanyDetails:
    """Fetch company reference details from Polygon.io."""
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    url = f"https://api.polygon.io/v3/reference/tickers/{ticker.upper()}"
    params = {"apiKey": settings.massive_api_key}

    response = httpx.get(url, params=params, timeout=10.0)
    response.raise_for_status()

    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No company data found for ticker '{ticker}'")

    r = results
    branding = r.get("branding") or {}
    logo_url: str | None = None
    if branding.get("logo_url"):
        logo_url = f"{branding['logo_url']}?apiKey={settings.massive_api_key}"

    return CompanyDetails(
        ticker=r.get("ticker", ticker.upper()),
        name=r.get("name", ""),
        description=r.get("description", ""),
        sic_description=r.get("sic_description", ""),
        primary_exchange=r.get("primary_exchange", ""),
        homepage_url=r.get("homepage_url"),
        total_employees=r.get("total_employees"),
        market_cap=r.get("market_cap"),
        logo_url=logo_url,
    )


@dataclass
class DailyBar:
    date: str   # ISO date string "YYYY-MM-DD"
    open: float
    high: float
    low: float
    close: float


CHART_TIMEFRAMES: dict[str, dict] = {
    "1D":  {"multiplier": 5,  "span": "minute", "days": 1},
    "1W":  {"multiplier": 30, "span": "minute", "days": 7},
    "1M":  {"multiplier": 1,  "span": "day",    "days": 30},
    "6M":  {"multiplier": 1,  "span": "day",    "days": 180},
    "12M": {"multiplier": 1,  "span": "day",    "days": 365},
    "5Y":  {"multiplier": 1,  "span": "week",   "days": 1825},
    "Max": {"multiplier": 1,  "span": "month",  "days": 7300},
}


def fetch_candles(ticker: str, timeframe: str) -> list[DailyBar]:
    """Fetch OHLC candles from Polygon.io for the given timeframe.

    Returns bars sorted oldest -> newest.
    """
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    tf = CHART_TIMEFRAMES.get(timeframe)
    if not tf:
        raise ValueError(f"Invalid timeframe '{timeframe}'")

    to_date = date.today()
    from_date = to_date - timedelta(days=tf["days"])

    url = (
        f"https://api.polygon.io/v2/aggs/ticker/{ticker.upper()}"
        f"/range/{tf['multiplier']}/{tf['span']}/{from_date}/{to_date}"
    )
    params = {
        "adjusted": "true",
        "sort": "asc",
        "limit": 5000,
        "apiKey": settings.massive_api_key,
    }

    response = httpx.get(url, params=params, timeout=10.0)
    response.raise_for_status()

    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No data for ticker '{ticker}'")

    return [
        DailyBar(
            date=date.fromtimestamp(r["t"] / 1000).strftime("%Y-%m-%d"),
            open=float(r["o"]),
            high=float(r["h"]),
            low=float(r["l"]),
            close=float(r["c"]),
        )
        for r in results
    ]


def fetch_daily_candles(ticker: str, days: int = 90) -> list[DailyBar]:
    """Fetch daily OHLCV candles from Polygon.io for the last `days` calendar days.

    Returns bars sorted oldest → newest.
    Raises ValueError if no data is found for the ticker or API key is missing.
    """
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    to_date = date.today()
    from_date = to_date - timedelta(days=days)

    url = (
        f"https://api.polygon.io/v2/aggs/ticker/{ticker.upper()}"
        f"/range/1/day/{from_date}/{to_date}"
    )
    params = {
        "adjusted": "true",
        "sort": "asc",
        "limit": 500,
        "apiKey": settings.massive_api_key,
    }

    response = httpx.get(url, params=params, timeout=10.0)
    response.raise_for_status()

    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No data for ticker '{ticker}'")

    return [
        DailyBar(
            date=date.fromtimestamp(r["t"] / 1000).strftime("%Y-%m-%d"),
            open=float(r["o"]),
            high=float(r["h"]),
            low=float(r["l"]),
            close=float(r["c"]),
        )
        for r in results
    ]
