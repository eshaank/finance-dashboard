import logging

from fastapi import APIRouter, HTTPException, Query

from app.schemas.models import CompanyDetailsResponse
from app.services import polygon

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/company/details", response_model=CompanyDetailsResponse)
def get_company_details(
    ticker: str = Query(..., min_length=1, max_length=10),
) -> CompanyDetailsResponse:
    try:
        result = polygon.fetch_company_details(ticker.upper())
        return CompanyDetailsResponse(
            ticker=result.ticker,
            name=result.name,
            description=result.description,
            sic_description=result.sic_description,
            primary_exchange=result.primary_exchange,
            homepage_url=result.homepage_url,
            total_employees=result.total_employees,
            market_cap=result.market_cap,
            logo_url=result.logo_url,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("company details failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc
