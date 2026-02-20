from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import company, economic_data, fundamentals, inside_days, market_indices, upcoming_events

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(market_indices.router, prefix="/api")
app.include_router(economic_data.router, prefix="/api")
app.include_router(upcoming_events.router, prefix="/api")
app.include_router(inside_days.router, prefix="/api")
app.include_router(fundamentals.router, prefix="/api")
app.include_router(company.router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
