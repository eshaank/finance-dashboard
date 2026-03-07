import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.short_interest import client
from app.domains.short_interest.schemas import (
    FloatData,
    ShortInterestEntry,
    ShortVolumeEntry,
)
from app.domains.short_interest.service import fetch_and_parse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/short-interest")


async def _handle(  # type: ignore[no-untyped-def]
    request: Request, ticker: str, fetcher, model, is_list: bool = True, page: int = 1, per_page: int = 50,
):
    try:
        result = await fetch_and_parse(fetcher, model, request.app.state.http_client, ticker, is_list)
        if is_list and isinstance(result, list):
            start = (page - 1) * per_page
            return result[start:start + per_page]
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("%s failed for %s", model.__name__, ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/short-interest", response_model=list[ShortInterestEntry])
async def get_short_interest(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[ShortInterestEntry]:
    return await _handle(request, ticker, client.get_short_interest, ShortInterestEntry, page=page, per_page=per_page)


@router.get("/short-volume", response_model=list[ShortVolumeEntry])
async def get_short_volume(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[ShortVolumeEntry]:
    return await _handle(request, ticker, client.get_short_volume, ShortVolumeEntry, page=page, per_page=per_page)


@router.get("/float", response_model=FloatData)
async def get_float(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> FloatData:
    result = await _handle(request, ticker, client.get_float, FloatData, is_list=False)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No float data found for '{ticker}'")
    return result
