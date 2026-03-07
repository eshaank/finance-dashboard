import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.company.client import fetch_company_details
from app.domains.company.schemas import CompanyDetailsResponse
from app.domains.company.service import to_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/company")


@router.get("/details", response_model=CompanyDetailsResponse)
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
