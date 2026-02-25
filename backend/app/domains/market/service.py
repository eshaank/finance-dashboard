from app.domains.market.client import CHART_TIMEFRAMES, DailyBar
from app.domains.market.schemas import OHLCBar

ALLOWED_TIMEFRAMES = list(CHART_TIMEFRAMES.keys())


def validate_timeframe(timeframe: str) -> None:
    if timeframe not in ALLOWED_TIMEFRAMES:
        raise ValueError(f"Invalid timeframe '{timeframe}'. Allowed: {ALLOWED_TIMEFRAMES}")


def bars_to_ohlc(bars: list[DailyBar]) -> list[OHLCBar]:
    return [
        OHLCBar(date=b.date, open=b.open, high=b.high, low=b.low, close=b.close, volume=b.volume)
        for b in bars
    ]
