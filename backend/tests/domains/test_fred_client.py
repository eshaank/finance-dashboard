"""Tests for the FRED API client."""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.domains.fred.client import (
    _obs_cache,
    _release_cache,
    fetch_release_dates,
    fetch_series_observations,
)


@pytest.fixture(autouse=True)
def _clear_caches():
    """Clear TTL caches before each test."""
    _obs_cache.clear()
    _release_cache.clear()
    yield
    _obs_cache.clear()
    _release_cache.clear()


MOCK_OBS_RESPONSE = {
    "observations": [
        {"date": "2026-01-01", "value": "3.5"},
        {"date": "2025-12-01", "value": "3.4"},
    ],
}

MOCK_RELEASES_RESPONSE = {
    "release_dates": [
        {"release_id": 10, "release_name": "Employment Situation", "date": "2026-03-07"},
        {"release_id": 53, "release_name": "Gross Domestic Product", "date": "2026-03-15"},
    ],
}


async def test_fetch_series_observations_returns_parsed_data() -> None:
    mock_response = MagicMock()
    mock_response.json.return_value = MOCK_OBS_RESPONSE

    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.fred.client.fetch_with_retry",
        new_callable=AsyncMock,
        return_value=mock_response,
    ), patch(
        "app.domains.fred.client.get_settings",
        return_value=MagicMock(fred_api_key="test-key", fred_base_url="https://api.stlouisfed.org/fred"),
    ):
        obs = await fetch_series_observations(client, "GDP")

    assert len(obs) == 2
    assert obs[0]["date"] == "2026-01-01"
    assert obs[0]["value"] == "3.5"

    # Verify cached on second call (no fetch needed)
    obs_cached = await fetch_series_observations(client, "GDP")
    assert obs_cached == obs


async def test_fetch_series_raises_without_api_key() -> None:
    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.fred.client.get_settings",
        return_value=MagicMock(fred_api_key=""),
    ):
        with pytest.raises(ValueError, match="FRED_API_KEY is not configured"):
            await fetch_series_observations(client, "GDP")


async def test_fetch_release_dates_returns_parsed_data() -> None:
    mock_response = MagicMock()
    mock_response.json.return_value = MOCK_RELEASES_RESPONSE

    client = AsyncMock(spec=httpx.AsyncClient)

    with patch(
        "app.domains.fred.client.fetch_with_retry",
        new_callable=AsyncMock,
        return_value=mock_response,
    ), patch(
        "app.domains.fred.client.get_settings",
        return_value=MagicMock(fred_api_key="test-key", fred_base_url="https://api.stlouisfed.org/fred"),
    ):
        releases = await fetch_release_dates(client)

    assert len(releases) == 2
    assert releases[0]["release_name"] == "Employment Situation"
