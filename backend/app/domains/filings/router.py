import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.filings.client import fetch_sec_filings
from app.domains.filings.schemas import SecFilingsResponse
from app.domains.filings.service import to_filings_response

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/filings", response_model=SecFilingsResponse)
async def get_sec_filings(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> SecFilingsResponse:
    try:
        cik, filings = await fetch_sec_filings(request.app.state.http_client, ticker.upper())
        return to_filings_response(ticker.upper(), cik, filings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("SEC filings failed for %s", ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc
