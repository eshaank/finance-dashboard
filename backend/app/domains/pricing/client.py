from dataclasses import dataclass
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_candle_cache: TTLCache[str, list["DailyBar"]] = TTLCache(maxsize=256, ttl=60)
_snapshot_cache: TTLCache[str, dict] = TTLCache(maxsize=256, ttl=15)


@dataclass
class DailyBar:
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float = 0


CHART_TIMEFRAMES: dict[str, dict] = {
    "1D": {"multiplier": 5, "span": "minute", "days": 1},
    "1W": {"multiplier": 30, "span": "minute", "days": 7},
    "1M": {"multiplier": 1, "span": "day", "days": 30},
    "6M": {"multiplier": 1, "span": "day", "days": 180},
    "12M": {"multiplier": 1, "span": "day", "days": 365},
    "5Y": {"multiplier": 1, "span": "week", "days": 1825},
    "Max": {"multiplier": 1, "span": "month", "days": 7300},
}


def _parse_bars(results: list[dict]) -> list[DailyBar]:
    return [
        DailyBar(
            date=date.fromtimestamp(r["t"] / 1000).strftime("%Y-%m-%d"),
            open=float(r["o"]),
            high=float(r["h"]),
            low=float(r["l"]),
            close=float(r["c"]),
            volume=float(r.get("v", 0)),
        )
        for r in results
    ]


@dataclass
class SnapshotQuote:
    ticker: str
    last: float
    change: float
    change_percent: float
    volume: float
    prev_close: float


async def fetch_candles(client: httpx.AsyncClient, ticker: str, timeframe: str) -> list[DailyBar]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    tf = CHART_TIMEFRAMES.get(timeframe)
    if not tf:
        raise ValueError(f"Invalid timeframe '{timeframe}'")

    cache_key = f"{ticker}:{timeframe}"
    if cache_key in _candle_cache:
        return _candle_cache[cache_key]

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

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No data for ticker '{ticker}'")

    bars = _parse_bars(results)
    _candle_cache[cache_key] = bars
    return bars


async def fetch_snapshot_quotes(client: httpx.AsyncClient, tickers: list[str]) -> list[SnapshotQuote]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    results: dict[str, SnapshotQuote] = {}
    missing: list[str] = []
    for t in tickers:
        key = f"snap:{t.upper()}"
        if key in _snapshot_cache:
            cached = _snapshot_cache[key]
            results[t.upper()] = SnapshotQuote(**cached)
        else:
            missing.append(t.upper())

    if missing:
        ticker_param = ",".join(missing)
        url = "https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers"
        params = {
            "tickers": ticker_param,
            "apiKey": settings.massive_api_key,
        }
        try:
            response = await fetch_with_retry(client, "GET", url, params=params)
            data = response.json()
            for snap in data.get("tickers", []):
                t = snap.get("ticker", "")
                day = snap.get("day", {})
                prev = snap.get("prevDay", {})
                todaysChange = snap.get("todaysChange", 0)
                todaysChangePct = snap.get("todaysChangePerc", 0)
                quote = SnapshotQuote(
                    ticker=t,
                    last=day.get("c", 0),
                    change=todaysChange,
                    change_percent=todaysChangePct,
                    volume=day.get("v", 0),
                    prev_close=prev.get("c", 0),
                )
                results[t] = quote
                _snapshot_cache[f"snap:{t}"] = {
                    "ticker": quote.ticker,
                    "last": quote.last,
                    "change": quote.change,
                    "change_percent": quote.change_percent,
                    "volume": quote.volume,
                    "prev_close": quote.prev_close,
                }
        except Exception:
            pass

    return [results[t.upper()] for t in tickers if t.upper() in results]


async def fetch_daily_candles(client: httpx.AsyncClient, ticker: str, days: int = 90) -> list[DailyBar]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = f"{ticker}:daily:{days}"
    if cache_key in _candle_cache:
        return _candle_cache[cache_key]

    to_date = date.today()
    from_date = to_date - timedelta(days=days)

    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker.upper()}/range/1/day/{from_date}/{to_date}"
    params = {
        "adjusted": "true",
        "sort": "asc",
        "limit": 500,
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results")

    if not results:
        raise ValueError(f"No data for ticker '{ticker}'")

    bars = _parse_bars(results)
    _candle_cache[cache_key] = bars
    return bars
