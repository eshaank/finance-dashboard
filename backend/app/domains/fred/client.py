import logging

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

logger = logging.getLogger(__name__)

FRED_SERIES: dict[str, tuple[str, str, str]] = {
    # series_id: (indicator_name, unit, category)
    "GDP": ("US GDP (Quarterly)", "B", "growth"),
    "PAYEMS": ("US Non-Farm Payrolls", "K", "employment"),
    "ICSA": ("US Initial Jobless Claims", "K", "employment"),
    "INDPRO": ("US Industrial Production", "%", "growth"),
    "RSAFS": ("US Retail Sales", "B", "consumer"),
    "UMCSENT": ("US Consumer Sentiment", "", "consumer"),
}

_obs_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=64, ttl=600)
_release_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=4, ttl=600)


async def fetch_series_observations(
    client: httpx.AsyncClient, series_id: str, limit: int = 2,
) -> list[dict]:
    cache_key = f"{series_id}:{limit}"
    if cache_key in _obs_cache:
        return _obs_cache[cache_key]

    settings = get_settings()
    if not settings.fred_api_key:
        raise ValueError("FRED_API_KEY is not configured")

    url = f"{settings.fred_base_url}/series/observations"
    params = {
        "series_id": series_id,
        "api_key": settings.fred_api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }
    response = await fetch_with_retry(client, "GET", url, params=params)
    observations = response.json().get("observations", [])
    _obs_cache[cache_key] = observations
    return observations


async def fetch_release_dates(
    client: httpx.AsyncClient, days_ahead: int = 30,
) -> list[dict]:
    cache_key = f"releases:{days_ahead}"
    if cache_key in _release_cache:
        return _release_cache[cache_key]

    settings = get_settings()
    if not settings.fred_api_key:
        raise ValueError("FRED_API_KEY is not configured")

    from datetime import date, timedelta

    today = date.today()
    end_date = today + timedelta(days=days_ahead)

    url = f"{settings.fred_base_url}/releases/dates"
    params = {
        "api_key": settings.fred_api_key,
        "file_type": "json",
        "sort_order": "asc",
        "include_release_dates_with_no_data": "true",
        "realtime_start": today.isoformat(),
        "realtime_end": end_date.isoformat(),
    }
    response = await fetch_with_retry(client, "GET", url, params=params)
    releases = response.json().get("release_dates", [])
    _release_cache[cache_key] = releases
    return releases
