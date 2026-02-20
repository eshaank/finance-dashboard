from fastapi import APIRouter, HTTPException, Query

from app.schemas.models import InsideDayResult, OHLCBar
from app.services.polygon import DailyBar, fetch_daily_candles

router = APIRouter()


def count_inside_days(bars: list[DailyBar]) -> tuple[int, list[str]]:
    """Count consecutive inside days ending at the most recent bar.

    All inside-day bars are compared against the same mother bar (the bar that
    started the pattern), not against each other sequentially. This correctly
    handles the case where individual inside bars vary in size while all
    remaining within the mother bar's range.
    """
    n = len(bars)
    if n < 2:
        return 0, []

    # Track the union of all candidate inside-bar ranges seen so far.
    # The mother bar must fully contain this union.
    effective_high = bars[-1].high
    effective_low = bars[-1].low
    count = 0

    for i in range(n - 2, -1, -1):
        curr = bars[i]
        if curr.high > effective_high and curr.low < effective_low:
            # curr contains all bars from i+1 onward — valid mother bar.
            # Keep going in case a wider bar further back extends the streak.
            count = n - 1 - i
        effective_high = max(effective_high, curr.high)
        effective_low = min(effective_low, curr.low)

    dates = [b.date for b in bars[n - count:]] if count > 0 else []
    return count, dates


@router.get("/inside-days", response_model=InsideDayResult)
def get_inside_days(ticker: str = Query(..., min_length=1, max_length=10)) -> InsideDayResult:
    try:
        bars = fetch_daily_candles(ticker)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if len(bars) < 2:
        raise HTTPException(status_code=400, detail=f"Insufficient data for ticker '{ticker}'")

    consecutive, inside_dates = count_inside_days(bars)

    # The mother bar is the bar immediately before the streak begins
    mother_bar_date: str | None = None
    compression_pct: float | None = None
    if consecutive > 0:
        streak_start_idx = len(bars) - consecutive - 1
        if streak_start_idx >= 0:
            mother_bar_date = bars[streak_start_idx].date
            mother = bars[streak_start_idx]
            mother_range = mother.high - mother.low
            latest_range = bars[-1].high - bars[-1].low
            if mother_range > 0:
                compression_pct = round((latest_range / mother_range) * 100, 1)

    chart_bars = [
        OHLCBar(date=b.date, open=b.open, high=b.high, low=b.low, close=b.close)
        for b in bars[-30:]
    ]

    return InsideDayResult(
        ticker=ticker.upper(),
        consecutive_inside_days=consecutive,
        inside_day_dates=inside_dates,
        mother_bar_date=mother_bar_date,
        latest_close=bars[-1].close,
        compression_pct=compression_pct,
        bars=chart_bars,
    )
