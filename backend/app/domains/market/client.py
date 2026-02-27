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


@dataclass
class SnapshotQuote:
    ticker: str
    last: float
    change: float
    change_percent: float
    volume: float
    prev_close: float


async def fetch_snapshot_quotes(client: httpx.AsyncClient, tickers: list[str]) -> list[SnapshotQuote]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    # Check cache first, collect misses
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
            pass  # Return whatever we have from cache

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


# Market-wide data caches (5 minutes TTL)
_market_news_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)
_splits_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)
_dividends_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)
_ipos_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)


@dataclass
class MarketNewsItem:
    id: str
    publisher_name: str
    publisher_homepage_url: str | None
    published_utc: str
    title: str
    description: str | None
    article_url: str
    tickers: list[str]
    image_url: str | None


@dataclass
class SplitItem:
    ticker: str
    execution_date: str
    split_from: int
    split_to: int


@dataclass
class DividendItem:
    ticker: str
    ex_dividend_date: str
    record_date: str | None
    pay_date: str | None
    declaration_date: str | None
    amount: float
    frequency: int


@dataclass
class IpoItem:
    ticker: str
    issuer_name: str
    offer_amount: float | None
    share_price: float | None
    share_price_from: float | None
    share_price_to: float | None
    shares: int | None
    listing_date: str
    status: str


async def fetch_market_news(client: httpx.AsyncClient, limit: int = 50) -> list[MarketNewsItem]:
    """Fetch general market news (not ticker-specific)."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = f"news:{limit}"
    if cache_key in _market_news_cache:
        return [_dict_to_news_item(item) for item in _market_news_cache[cache_key]]

    url = "https://api.polygon.io/v2/reference/news"
    params = {
        "limit": limit,
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])
    _market_news_cache[cache_key] = results

    return [_dict_to_news_item(item) for item in results]


def _dict_to_news_item(item: dict) -> MarketNewsItem:
    publisher = item.get("publisher", {})
    return MarketNewsItem(
        id=item.get("id", ""),
        publisher_name=publisher.get("name", ""),
        publisher_homepage_url=publisher.get("homepage_url"),
        published_utc=item.get("published_utc", ""),
        title=item.get("title", ""),
        description=item.get("description"),
        article_url=item.get("article_url", ""),
        tickers=item.get("tickers", []),
        image_url=item.get("image_url"),
    )


async def fetch_upcoming_splits(client: httpx.AsyncClient) -> list[SplitItem]:
    """Fetch stock splits for the next 30 days."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = "splits:upcoming"
    if cache_key in _splits_cache:
        return [_dict_to_split_item(item) for item in _splits_cache[cache_key]]

    today = date.today()
    future = today + timedelta(days=30)

    url = "https://api.polygon.io/v3/reference/splits"
    params = {
        "execution_date.gte": today.isoformat(),
        "execution_date.lte": future.isoformat(),
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])
    _splits_cache[cache_key] = results

    return [_dict_to_split_item(item) for item in results]


def _dict_to_split_item(item: dict) -> SplitItem:
    return SplitItem(
        ticker=item.get("ticker", ""),
        execution_date=item.get("execution_date", ""),
        split_from=item.get("split_from", 1),
        split_to=item.get("split_to", 1),
    )


async def fetch_upcoming_dividends(client: httpx.AsyncClient) -> list[DividendItem]:
    """Fetch dividends with ex-dividend dates in the next 30 days."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = "dividends:upcoming"
    if cache_key in _dividends_cache:
        return [_dict_to_dividend_item(item) for item in _dividends_cache[cache_key]]

    today = date.today()
    future = today + timedelta(days=30)

    url = "https://api.polygon.io/v3/reference/dividends"
    params = {
        "ex_dividend_date.gte": today.isoformat(),
        "ex_dividend_date.lte": future.isoformat(),
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])
    _dividends_cache[cache_key] = results

    return [_dict_to_dividend_item(item) for item in results]


def _dict_to_dividend_item(item: dict) -> DividendItem:
    return DividendItem(
        ticker=item.get("ticker", ""),
        ex_dividend_date=item.get("ex_dividend_date", ""),
        record_date=item.get("record_date"),
        pay_date=item.get("pay_date"),
        declaration_date=item.get("declaration_date"),
        amount=item.get("cash_amount", 0.0),
        frequency=item.get("frequency", 0),
    )


async def fetch_recent_ipos(client: httpx.AsyncClient) -> list[IpoItem]:
    """Fetch IPOs from the last 90 days."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = "ipos:recent"
    if cache_key in _ipos_cache:
        return [_dict_to_ipo_item(item) for item in _ipos_cache[cache_key]]

    today = date.today()
    past = today - timedelta(days=90)

    url = "https://api.massive.com/vX/reference/ipos"
    params = {
        "listing_date.gte": past.isoformat(),
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])
    _ipos_cache[cache_key] = results

    return [_dict_to_ipo_item(item) for item in results]


def _dict_to_ipo_item(item: dict) -> IpoItem:
    return IpoItem(
        ticker=item.get("ticker", ""),
        issuer_name=item.get("issuer_name", ""),
        offer_amount=item.get("offer_amount"),
        share_price=item.get("share_price"),
        share_price_from=item.get("share_price_from"),
        share_price_to=item.get("share_price_to"),
        shares=item.get("shares"),
        listing_date=item.get("listing_date", ""),
        status=item.get("status", ""),
    )
