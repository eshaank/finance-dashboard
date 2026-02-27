from fastapi import APIRouter

from app.domains.economics.router import router as economics_router
from app.domains.filings.router import router as filings_router
from app.domains.fundamentals.router import router as fundamentals_router
from app.domains.market.router import router as market_router
from app.domains.news.router import router as news_router
from app.domains.research.router import router as research_router
from app.domains.scanner.router import router as scanner_router

api_router = APIRouter()

api_router.include_router(market_router, tags=["market"])
api_router.include_router(research_router, tags=["research"])
api_router.include_router(fundamentals_router, tags=["fundamentals"])
api_router.include_router(scanner_router, tags=["scanner"])
api_router.include_router(economics_router, tags=["economics"])
api_router.include_router(news_router, tags=["news"])
api_router.include_router(filings_router, tags=["filings"])
