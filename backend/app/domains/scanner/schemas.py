from pydantic import BaseModel

from app.domains.pricing.schemas import OHLCBar


class InsideDayResult(BaseModel):
    ticker: str
    consecutive_inside_days: int
    inside_day_dates: list[str]
    mother_bar_date: str | None
    latest_close: float
    compression_pct: float | None
    bars: list[OHLCBar]


class BulkInsideDayItem(BaseModel):
    ticker: str
    name: str | None
    consecutive_inside_days: int
    compression_pct: float | None
    mother_bar_date: str | None
    latest_close: float
    market_cap: float | None
    inside_day_dates: list[str]
    avg_volume: float | None = None
    today_volume: float | None = None
    relative_volume: float | None = None
    atr_pct: float | None = None
    ticker_type: str | None = None


class BulkInsideDayResult(BaseModel):
    results: list[BulkInsideDayItem]
    total_scanned: int
    total_with_inside_days: int
    scan_date: str
    preset: str
