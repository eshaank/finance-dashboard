from pydantic import BaseModel


class ShortInterestEntry(BaseModel):
    ticker: str
    settlement_date: str
    short_interest: int | None = None
    days_to_cover: float | None = None
    avg_daily_volume: int | None = None


class ShortVolumeEntry(BaseModel):
    ticker: str
    date: str
    short_volume: int | None = None
    total_volume: int | None = None
    short_volume_ratio: float | None = None


class FloatData(BaseModel):
    ticker: str
    free_float: int | None = None
    free_float_percent: float | None = None
    effective_date: str | None = None
