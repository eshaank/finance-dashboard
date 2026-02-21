from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.market.client import fetch_daily_candles
from app.domains.market.service import bars_to_ohlc
from app.domains.scanner.schemas import InsideDayResult
from app.domains.scanner.service import compute_compression, count_inside_days

router = APIRouter()


@router.get("/inside-days", response_model=InsideDayResult)
async def get_inside_days(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    _user: dict = Depends(get_current_user),
) -> InsideDayResult:
    try:
        bars = await fetch_daily_candles(request.app.state.http_client, ticker)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if len(bars) < 2:
        raise HTTPException(status_code=400, detail=f"Insufficient data for ticker '{ticker}'")

    consecutive, inside_dates = count_inside_days(bars)
    mother_bar_date, compression_pct = compute_compression(bars, consecutive)

    return InsideDayResult(
        ticker=ticker.upper(),
        consecutive_inside_days=consecutive,
        inside_day_dates=inside_dates,
        mother_bar_date=mother_bar_date,
        latest_close=bars[-1].close,
        compression_pct=compression_pct,
        bars=bars_to_ohlc(bars[-30:]),
    )
