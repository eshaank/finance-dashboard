"""IMF domain service: maps client responses to API schemas."""

import logging

import httpx

from app.domains.imf.client import fetch_imf_dataset_list, fetch_imf_series
from app.domains.imf.schemas import IMFDataSetSummary, IMFSeriesObservation

logger = logging.getLogger(__name__)


async def get_imf_datasets(client: httpx.AsyncClient) -> list[IMFDataSetSummary]:
    """Return list of available IMF datasets for the API."""
    raw = await fetch_imf_dataset_list(client)
    return [
        IMFDataSetSummary(
            dataset_id=item.get("dataset_id", ""),
            name=item.get("name", ""),
            description=item.get("description"),
        )
        for item in raw
        if item.get("dataset_id")
    ]


async def get_imf_series(
    client: httpx.AsyncClient,
    dataset_id: str,
    country_codes: list[str] | None = None,
    indicator_codes: list[str] | None = None,
    start_year: int | None = None,
    end_year: int | None = None,
) -> list[IMFSeriesObservation]:
    """Return IMF series observations for the given dataset and filters."""
    raw = await fetch_imf_series(
        client,
        dataset_id=dataset_id,
        country_codes=country_codes,
        indicator_codes=indicator_codes,
        start_year=start_year,
        end_year=end_year,
    )
    return [
        IMFSeriesObservation(
            country_code=item.get("country_code", ""),
            country_name=item.get("country_name", ""),
            indicator_code=item.get("indicator_code", ""),
            indicator_name=item.get("indicator_name", ""),
            year=int(item["year"]) if item.get("year") is not None else 0,
            value=item.get("value"),
            unit=item.get("unit"),
        )
        for item in raw
        if item.get("country_code") and item.get("indicator_code")
    ]
