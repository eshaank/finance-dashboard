from pydantic import BaseModel

from app.domains.market.schemas import OHLCBar


class InsideDayResult(BaseModel):
    ticker: str
    consecutive_inside_days: int
    inside_day_dates: list[str]
    mother_bar_date: str | None
    latest_close: float
    compression_pct: float | None
    bars: list[OHLCBar]
