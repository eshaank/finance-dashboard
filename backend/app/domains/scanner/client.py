import asyncio
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.domains.market.client import DailyBar
from app.shared.http_client import fetch_with_retry

_grouped_cache: TTLCache[str, list] = TTLCache(maxsize=10, ttl=600)
_details_cache: TTLCache[str, dict] = TTLCache(maxsize=2000, ttl=86400)


async def fetch_grouped_daily(
    client: httpx.AsyncClient, date_str: str,
) -> list[dict]:
    """Fetch grouped daily bars for all US stocks on a given date."""
    if date_str in _grouped_cache:
        return _grouped_cache[date_str]

    settings = get_settings()
    url = (
        f"https://api.polygon.io/v2/aggs/grouped"
        f"/locale/us/market/stocks/{date_str}"
    )
    params = {"apiKey": settings.massive_api_key}

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])

    _grouped_cache[date_str] = results
    return results


async def fetch_grouped_multi_day(
    client: httpx.AsyncClient, num_days: int = 5,
) -> dict[str, list[DailyBar]]:
    """Fetch grouped daily bars for the last num_days trading days.

    Walks backward from today, skipping weekends. Returns bars grouped
    by ticker symbol, sorted by date ascending.
    """
    dates: list[str] = []
    current = date.today()
    while len(dates) < num_days:
        current -= timedelta(days=1)
        if current.weekday() in (5, 6):
            continue
        dates.append(current.strftime("%Y-%m-%d"))

    day_results = await asyncio.gather(
        *(fetch_grouped_daily(client, d) for d in dates)
    )

    ticker_bars: dict[str, list[DailyBar]] = {}
    for day_data in day_results:
        for r in day_data:
            ticker = r.get("T", "")
            if not ticker:
                continue
            bar = DailyBar(
                date=date.fromtimestamp(r["t"] / 1000).strftime("%Y-%m-%d"),
                open=float(r["o"]),
                high=float(r["h"]),
                low=float(r["l"]),
                close=float(r["c"]),
            )
            ticker_bars.setdefault(ticker, []).append(bar)

    for bars in ticker_bars.values():
        bars.sort(key=lambda b: b.date)

    return ticker_bars


async def fetch_ticker_details(
    client: httpx.AsyncClient, ticker: str,
) -> dict:
    """Fetch ticker name and market cap from Polygon reference endpoint."""
    if ticker in _details_cache:
        return _details_cache[ticker]

    settings = get_settings()
    url = f"https://api.polygon.io/v3/reference/tickers/{ticker}"
    params = {"apiKey": settings.massive_api_key}

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", {})

    detail = {
        "name": results.get("name"),
        "market_cap": results.get("market_cap"),
    }
    _details_cache[ticker] = detail
    return detail


async def fetch_ticker_details_batch(
    client: httpx.AsyncClient,
    tickers: list[str],
    concurrency: int = 20,
) -> dict[str, dict]:
    """Fetch ticker details for multiple tickers in parallel with concurrency limit."""
    sem = asyncio.Semaphore(concurrency)

    async def _fetch(t: str) -> dict:
        async with sem:
            return await fetch_ticker_details(client, t)

    results = await asyncio.gather(
        *(_fetch(t) for t in tickers), return_exceptions=True,
    )
    return {
        t: (r if isinstance(r, dict) else {})
        for t, r in zip(tickers, results)
    }
