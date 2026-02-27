import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.news.client import fetch_company_news
from app.domains.news.schemas import CompanyNewsResponse
from app.domains.news.service import to_news_response

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/news", response_model=CompanyNewsResponse)
async def get_company_news(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    limit: int = Query(20, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> CompanyNewsResponse:
    try:
        results = await fetch_company_news(request.app.state.http_client, ticker.upper(), limit)
        return to_news_response(ticker.upper(), results)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("company news failed for %s", ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc
