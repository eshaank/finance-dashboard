from typing import Literal

from pydantic import BaseModel


class EconomicDataPoint(BaseModel):
    id: str
    indicator: str
    country: str
    previous: float | None
    forecast: float | None
    actual: float | None
    status: Literal["beat", "missed", "inline", "pending"]
    date: str
    unit: str


class UpcomingEvent(BaseModel):
    id: str
    name: str
    datetime: str
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    category: str
    daysUntil: int
