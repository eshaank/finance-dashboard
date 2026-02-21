from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent
from app.domains.economics.service import get_economic_data, get_upcoming_events

router = APIRouter()


@router.get("/economic-data", response_model=list[EconomicDataPoint])
async def economic_data(_user: dict = Depends(get_current_user)) -> list[EconomicDataPoint]:
    return get_economic_data()


@router.get("/upcoming-events", response_model=list[UpcomingEvent])
async def upcoming_events(_user: dict = Depends(get_current_user)) -> list[UpcomingEvent]:
    return get_upcoming_events()
