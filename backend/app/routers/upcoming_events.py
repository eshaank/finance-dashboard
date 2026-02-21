from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.data.mock_data import UPCOMING_EVENTS
from app.schemas.models import UpcomingEvent

router = APIRouter()


@router.get("/upcoming-events", response_model=list[UpcomingEvent])
def get_upcoming_events(_user: dict = Depends(get_current_user)) -> list[UpcomingEvent]:
    return UPCOMING_EVENTS
