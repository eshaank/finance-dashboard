import httpx

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry


async def _get(client: httpx.AsyncClient, path: str, params: dict | None = None) -> list[dict]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")
    if params is None:
        params = {}
    params["apiKey"] = settings.massive_api_key
    url = f"{settings.massive_base_url}{path}"
    response = await fetch_with_retry(client, "GET", url, params=params)
    return response.json().get("results", [])


async def get_inflation(client: httpx.AsyncClient) -> list[dict]:
    return await _get(client, "/fed/v1/inflation", {
        "sort": "date.desc", "limit": 2,
    })


async def get_inflation_expectations(client: httpx.AsyncClient) -> list[dict]:
    return await _get(client, "/fed/v1/inflation-expectations", {
        "sort": "date.desc", "limit": 2,
    })


async def get_treasury_yields(client: httpx.AsyncClient) -> list[dict]:
    return await _get(client, "/fed/v1/treasury-yields", {
        "sort": "date.desc", "limit": 2,
    })


async def get_labor_market(client: httpx.AsyncClient) -> list[dict]:
    return await _get(client, "/fed/v1/labor-market", {
        "sort": "date.desc", "limit": 2,
    })
