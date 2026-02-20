from dataclasses import dataclass
from datetime import date, timedelta

import httpx

from app.config import settings


@dataclass
class DailyBar:
    date: str   # ISO date string "YYYY-MM-DD"
    open: float
    high: float
    low: float
    close: float


def fetch_daily_candles(ticker: str, days: int = 90) -> list[DailyBar]:
    """Fetch daily OHLCV candles from Polygon.io for the last `days` calendar days.

    Returns bars sorted oldest → newest.
    Raises ValueError if no data is found for the ticker or API key is missing.
    """
    if not settings.polygon_api_key:
        raise ValueError("POLYGON_API_KEY is not configured")

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
        "apiKey": settings.polygon_api_key,
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
