"""IMF Data API client. Skeleton for future IMF Data Portal / API integration."""

import logging

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

logger = logging.getLogger(__name__)

# TTL cache for IMF responses (e.g. 10 min when implemented)
_imf_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=32, ttl=600)


async def fetch_imf_dataset_list(
    client: httpx.AsyncClient,
) -> list[dict]:
    """
    Fetch list of available IMF datasets (placeholder).
    When implemented: call IMF Data API (e.g. http://dataservices.imf.org/REST/SDMX_JSON.svc/)
    or IMF Data Portal API with IMF_API_KEY.
    """
    settings = get_settings()
    if not settings.imf_api_key:
        logger.debug("IMF_API_KEY not configured; returning empty dataset list")
        return []

    cache_key = "imf:datasets"
    if cache_key in _imf_cache:
        return _imf_cache[cache_key]

    # Placeholder: real implementation would call e.g.:
    # url = f"{settings.imf_base_url}/..."
    # response = await fetch_with_retry(client, "GET", url, params={"api_key": settings.imf_api_key})
    # data = response.json()
    _imf_cache[cache_key] = []
    return []


async def fetch_imf_series(
    client: httpx.AsyncClient,
    dataset_id: str,
    country_codes: list[str] | None = None,
    indicator_codes: list[str] | None = None,
    start_year: int | None = None,
    end_year: int | None = None,
) -> list[dict]:
    """
    Fetch series observations for an IMF dataset (placeholder).
    When implemented: use dataset_id and optional filters to query IMF API.
    """
    settings = get_settings()
    if not settings.imf_api_key:
        logger.debug("IMF_API_KEY not configured; returning empty series")
        return []

    cache_key = f"imf:series:{dataset_id}:{country_codes}:{indicator_codes}:{start_year}:{end_year}"
    if cache_key in _imf_cache:
        return _imf_cache[cache_key]

    # Placeholder: real implementation would build query and call IMF API
    result: list[dict] = []
    _imf_cache[cache_key] = result
    return result
