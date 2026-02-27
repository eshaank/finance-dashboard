import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.research.client import (
    fetch_company_details,
    fetch_dividend_history,
    fetch_split_history,
)
from app.domains.research.schemas import (
    CompanyDetailsResponse,
    DividendHistoryResponse,
    SplitHistoryResponse,
)
from app.domains.research.service import (
    to_dividend_response,
    to_response,
    to_split_response,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/company/details", response_model=CompanyDetailsResponse)
async def get_company_details(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> CompanyDetailsResponse:
    try:
        result = await fetch_company_details(request.app.state.http_client, ticker.upper())
        return to_response(result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("company details failed for %s", ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/dividends", response_model=DividendHistoryResponse)
async def get_dividend_history(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> DividendHistoryResponse:
    try:
        results = await fetch_dividend_history(request.app.state.http_client, ticker.upper())
        return to_dividend_response(ticker.upper(), results)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("dividend history failed for %s", ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/splits", response_model=SplitHistoryResponse)
async def get_split_history(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> SplitHistoryResponse:
    try:
        results = await fetch_split_history(request.app.state.http_client, ticker.upper())
        return to_split_response(ticker.upper(), results)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("split history failed for %s", ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc
