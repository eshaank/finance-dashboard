from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent
from app.data.mock_data import ECONOMIC_DATA, UPCOMING_EVENTS


def get_economic_data() -> list[EconomicDataPoint]:
    return ECONOMIC_DATA


def get_upcoming_events() -> list[UpcomingEvent]:
    return UPCOMING_EVENTS
