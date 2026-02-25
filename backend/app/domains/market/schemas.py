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


class OHLCBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float = 0


class PriceChartResult(BaseModel):
    ticker: str
    timeframe: str
    bars: list[OHLCBar]
    latest_close: float
