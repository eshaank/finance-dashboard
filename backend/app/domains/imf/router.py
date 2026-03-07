"""IMF data retrieval API routes."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.imf.schemas import IMFDataSetSummary, IMFSeriesObservation
from app.domains.imf.service import get_imf_datasets, get_imf_series

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/imf/datasets", response_model=list[IMFDataSetSummary])
async def list_imf_datasets(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[IMFDataSetSummary]:
    """List available IMF datasets (e.g. WEO, IFS). Skeleton endpoint."""
    try:
        return await get_imf_datasets(request.app.state.http_client)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("list_imf_datasets failed")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/imf/series", response_model=list[IMFSeriesObservation])
async def imf_series(
    request: Request,
    dataset_id: str = Query(..., min_length=1, description="IMF dataset ID (e.g. WEO, IFS)"),
    country_codes: str | None = Query(None, description="Comma-separated country codes"),
    indicator_codes: str | None = Query(None, description="Comma-separated indicator codes"),
    start_year: int | None = Query(None, ge=1950, le=2100),
    end_year: int | None = Query(None, ge=1950, le=2100),
    _user: dict = Depends(get_current_user),
) -> list[IMFSeriesObservation]:
    """Fetch IMF series observations for a dataset. Skeleton endpoint."""
    try:
        countries = [c.strip() for c in country_codes.split(",")] if country_codes else None
        indicators = [i.strip() for i in indicator_codes.split(",")] if indicator_codes else None
        return await get_imf_series(
            request.app.state.http_client,
            dataset_id=dataset_id,
            country_codes=countries,
            indicator_codes=indicators,
            start_year=start_year,
            end_year=end_year,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("get_imf_series failed for dataset_id=%s", dataset_id)
        raise HTTPException(status_code=502, detail="External API error") from exc
