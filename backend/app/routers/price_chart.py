from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.schemas.models import OHLCBar, PriceChartResult
from app.services.polygon import CHART_TIMEFRAMES, fetch_candles

router = APIRouter()

ALLOWED_TIMEFRAMES = list(CHART_TIMEFRAMES.keys())


@router.get("/price-chart", response_model=PriceChartResult)
def get_price_chart(
    ticker: str = Query(..., min_length=1, max_length=10),
    timeframe: str = Query("1M"),
    _user: dict = Depends(get_current_user),
) -> PriceChartResult:
    if timeframe not in ALLOWED_TIMEFRAMES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timeframe '{timeframe}'. Allowed: {ALLOWED_TIMEFRAMES}",
        )

    try:
        bars = fetch_candles(ticker, timeframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not bars:
        raise HTTPException(status_code=400, detail=f"No data for ticker '{ticker}'")

    chart_bars = [
        OHLCBar(date=b.date, open=b.open, high=b.high, low=b.low, close=b.close)
        for b in bars
    ]

    return PriceChartResult(
        ticker=ticker.upper(),
        timeframe=timeframe,
        bars=chart_bars,
        latest_close=bars[-1].close,
    )
