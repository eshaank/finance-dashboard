from fastapi import APIRouter

from app.domains.company.router import router as company_router
from app.domains.corporate_actions.router import router as corporate_actions_router
from app.domains.economics.router import router as economics_router
from app.domains.filings.router import router as filings_router
from app.domains.financials.router import router as financials_router
from app.domains.imf.router import router as imf_router
from app.domains.news.router import router as news_router
from app.domains.polymarket.router import router as polymarket_router
from app.domains.pricing.router import router as pricing_router
from app.domains.scanner.router import router as scanner_router
from app.domains.short_interest.router import router as short_interest_router

api_router = APIRouter()

api_router.include_router(pricing_router, tags=["pricing"])
api_router.include_router(company_router, tags=["company"])
api_router.include_router(financials_router, tags=["financials"])
api_router.include_router(short_interest_router, tags=["short_interest"])
api_router.include_router(corporate_actions_router, tags=["corporate_actions"])
api_router.include_router(scanner_router, tags=["scanner"])
api_router.include_router(economics_router, tags=["economics"])
api_router.include_router(news_router, tags=["news"])
api_router.include_router(filings_router, tags=["filings"])
api_router.include_router(imf_router, tags=["imf"])
api_router.include_router(polymarket_router, tags=["polymarket"])
