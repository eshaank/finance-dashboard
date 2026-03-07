from dataclasses import dataclass
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_dividend_cache: TTLCache[str, list["DividendInfo"]] = TTLCache(maxsize=128, ttl=300)
_split_cache: TTLCache[str, list["SplitInfo"]] = TTLCache(maxsize=128, ttl=300)


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


# Market-wide corporate action caches (5 minutes TTL)
_upcoming_splits_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)
_upcoming_dividends_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)
_ipos_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1, ttl=300)


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


async def fetch_upcoming_splits(client: httpx.AsyncClient) -> list[SplitItem]:
    """Fetch stock splits for the next 30 days."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    cache_key = "splits:upcoming"
    if cache_key in _upcoming_splits_cache:
        return [_dict_to_split_item(item) for item in _upcoming_splits_cache[cache_key]]

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
    _upcoming_splits_cache[cache_key] = results

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
    if cache_key in _upcoming_dividends_cache:
        return [_dict_to_dividend_item(item) for item in _upcoming_dividends_cache[cache_key]]

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
    _upcoming_dividends_cache[cache_key] = results

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
