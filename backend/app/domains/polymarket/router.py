import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.polymarket.client import fetch_event_by_slug, fetch_events
from app.domains.polymarket.schemas import (
    PolymarketEvent,
    PolymarketEventsResponse,
    PolymarketStats,
)
from app.domains.polymarket.service import (
    compute_stats,
    extract_trending,
    raw_event_to_schema,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/polymarket/events", response_model=PolymarketEventsResponse)
async def get_polymarket_events(
    request: Request,
    category: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> PolymarketEventsResponse:
    try:
        raw_events = await fetch_events(
            request.app.state.http_client,
            category=category,
            limit=limit,
        )
        events = [raw_event_to_schema(e) for e in raw_events]
        trending = extract_trending(events)
        return PolymarketEventsResponse(
            events=events,
            trending=trending,
            total=len(events),
        )
    except Exception as exc:
        logger.exception("Failed to fetch Polymarket events")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/polymarket/events/{slug}", response_model=PolymarketEvent)
async def get_polymarket_event_by_slug(
    request: Request,
    slug: str,
    _user: dict = Depends(get_current_user),
) -> PolymarketEvent:
    try:
        raw = await fetch_event_by_slug(request.app.state.http_client, slug)
        if not raw:
            raise HTTPException(status_code=404, detail=f"Event '{slug}' not found")
        return raw_event_to_schema(raw)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch Polymarket event")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/polymarket/stats", response_model=PolymarketStats)
async def get_polymarket_stats(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> PolymarketStats:
    try:
        raw_events = await fetch_events(
            request.app.state.http_client,
            limit=100,
        )
        events = [raw_event_to_schema(e) for e in raw_events]
        return compute_stats(events)
    except Exception as exc:
        logger.exception("Failed to compute Polymarket stats")
        raise HTTPException(status_code=502, detail="External API error") from exc
