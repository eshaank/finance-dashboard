from typing import Literal
from pydantic import BaseModel


class MarketIndex(BaseModel):
    id: str
    ticker: str
    name: str
    price: float
    change: float
    changePercent: float
    exchange: str
    trend: Literal["up", "down"]


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


class OHLCBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float


class InsideDayResult(BaseModel):
    ticker: str
    consecutive_inside_days: int
    inside_day_dates: list[str]
    mother_bar_date: str | None
    latest_close: float
    compression_pct: float | None
    bars: list[OHLCBar]  # last 30 bars, oldest → newest
