from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppException, app_exception_handler
from app.core.middleware import RequestLoggingMiddleware
from app.core.rate_limit import limiter
from app.shared.http_client import create_async_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.http_client = create_async_client()
    yield
    await app.state.http_client.aclose()


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Bloomberg terminal-inspired finance dashboard API. "
        "Proxies Polygon.io and Massive API for market data, fundamentals, and technical analysis."
    ),
    debug=settings.debug,
    lifespan=lifespan,
    openapi_tags=[
        {"name": "market", "description": "Market indices and price chart data (Polygon.io)"},
        {"name": "research", "description": "Company details and reference data (Polygon.io)"},
        {"name": "fundamentals", "description": "Financial statements, ratios, short data (Massive API)"},
        {"name": "scanner", "description": "Technical pattern scanners (inside days)"},
        {"name": "economics", "description": "Economic indicators and upcoming events"},
    ],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom exception handler
app.add_exception_handler(AppException, app_exception_handler)

# Request logging + request ID
app.add_middleware(RequestLoggingMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*", "X-Widget-ID"],
    expose_headers=["X-Request-ID"],
)

# API v1 routes
app.include_router(api_router, prefix="/api/v1")

# Backward-compatible mount at /api for existing frontend
app.include_router(api_router, prefix="/api")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
