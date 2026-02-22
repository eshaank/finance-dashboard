import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.security import get_current_user
from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent
from app.domains.economics.service import get_economic_data, get_upcoming_events

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/economic-data", response_model=list[EconomicDataPoint])
async def economic_data(
    request: Request, _user: dict = Depends(get_current_user),
) -> list[EconomicDataPoint]:
    try:
        return await get_economic_data(request.app.state.http_client)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("economic_data failed")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/upcoming-events", response_model=list[UpcomingEvent])
async def upcoming_events(
    request: Request, _user: dict = Depends(get_current_user),
) -> list[UpcomingEvent]:
    try:
        return await get_upcoming_events(request.app.state.http_client)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("upcoming_events failed")
        raise HTTPException(status_code=502, detail="External API error") from exc
