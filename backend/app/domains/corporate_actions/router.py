import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.corporate_actions.client import (
    fetch_dividend_history,
    fetch_split_history,
    fetch_upcoming_splits,
    fetch_upcoming_dividends,
    fetch_recent_ipos,
)
from app.domains.corporate_actions.schemas import (
    DividendHistoryResponse,
    SplitHistoryResponse,
    SplitItem,
    DividendItem,
    IpoItem,
)
from app.domains.corporate_actions.service import (
    to_dividend_response,
    to_split_response,
    split_item_to_schema,
    dividend_item_to_schema,
    ipo_item_to_schema,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/corporate-actions")


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


@router.get("/upcoming-splits", response_model=list[SplitItem])
async def get_upcoming_splits(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[SplitItem]:
    """Fetch stock splits scheduled for the next 30 days."""
    try:
        items = await fetch_upcoming_splits(request.app.state.http_client)
        return [split_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch upcoming splits")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/upcoming-dividends", response_model=list[DividendItem])
async def get_upcoming_dividends(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[DividendItem]:
    """Fetch dividends with ex-dividend dates in the next 30 days."""
    try:
        items = await fetch_upcoming_dividends(request.app.state.http_client)
        return [dividend_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch upcoming dividends")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/recent-ipos", response_model=list[IpoItem])
async def get_recent_ipos(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[IpoItem]:
    """Fetch IPOs from the last 90 days."""
    try:
        items = await fetch_recent_ipos(request.app.state.http_client)
        return [ipo_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch recent IPOs")
        raise HTTPException(status_code=502, detail="External API error") from exc
