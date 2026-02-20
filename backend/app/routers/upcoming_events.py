from fastapi import APIRouter

from app.data.mock_data import UPCOMING_EVENTS
from app.schemas.models import UpcomingEvent

router = APIRouter()


@router.get("/upcoming-events", response_model=list[UpcomingEvent])
def get_upcoming_events() -> list[UpcomingEvent]:
    return UPCOMING_EVENTS
