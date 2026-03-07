import httpx
from cachetools import TTLCache

from app.shared.http_client import fetch_with_retry

GAMMA_BASE_URL = "https://gamma-api.polymarket.com"

_events_cache: TTLCache[str, list[dict]] = TTLCache(maxsize=64, ttl=120)
_event_slug_cache: TTLCache[str, dict] = TTLCache(maxsize=128, ttl=120)


async def fetch_events(
    client: httpx.AsyncClient,
    category: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    cache_key = f"events:{category}:{limit}:{offset}"
    if cache_key in _events_cache:
        return _events_cache[cache_key]

    params: dict[str, str | int] = {
        "limit": limit,
        "offset": offset,
        "active": "true",
        "closed": "false",
        "order": "volume24hr",
        "ascending": "false",
    }
    # Gamma API uses tag_slug for filtering. UI label -> slug mapping.
    CATEGORY_SLUGS = {
        "politics": "politics",
        "crypto": "crypto",
        "sports": "sports",
        "culture": "pop-culture",
        "science": "science",
    }
    if category and category.lower() != "all":
        slug = CATEGORY_SLUGS.get(category.lower(), category.lower())
        params["tag_slug"] = slug

    url = f"{GAMMA_BASE_URL}/events"
    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()

    results = data if isinstance(data, list) else []
    _events_cache[cache_key] = results
    return results


async def fetch_event_by_slug(
    client: httpx.AsyncClient,
    slug: str,
) -> dict | None:
    cache_key = f"slug:{slug}"
    if cache_key in _event_slug_cache:
        return _event_slug_cache[cache_key]

    url = f"{GAMMA_BASE_URL}/events"
    params = {"slug": slug}
    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()

    results = data if isinstance(data, list) else []
    if not results:
        return None

    event = results[0]
    _event_slug_cache[cache_key] = event
    return event
