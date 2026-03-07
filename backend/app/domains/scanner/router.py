from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.pricing.client import fetch_daily_candles
from app.domains.pricing.service import bars_to_ohlc
from app.domains.scanner.client import fetch_grouped_multi_day, fetch_ticker_details_batch
from app.domains.scanner.constituents import get_constituents
from app.domains.scanner.schemas import BulkInsideDayItem, BulkInsideDayResult, InsideDayResult
from app.domains.scanner.service import (
    compute_compression,
    count_inside_days,
    scan_ticker_for_inside_days,
)

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


@router.get("/scan-inside-days", response_model=BulkInsideDayResult)
async def scan_inside_days(
    request: Request,
    preset: str = Query("all", pattern="^(all|spy500|nasdaq100)$"),
    min_cap: float | None = Query(None),
    max_cap: float | None = Query(None),
    min_price: float | None = Query(None),
    min_avg_volume: float | None = Query(None),
    min_relative_volume: float | None = Query(None),
    min_atr_pct: float | None = Query(None),
    exclude_etfs: bool = Query(True),
    _user: dict = Depends(get_current_user),
) -> BulkInsideDayResult:
    """Scan the market for stocks with consecutive inside days."""
    http = request.app.state.http_client
    ticker_bars = await fetch_grouped_multi_day(http)
    # Filter to preset constituents if applicable
    constituents = get_constituents(preset)
    if constituents is not None:
        ticker_bars = {
            t: bars for t, bars in ticker_bars.items() if t in constituents
        }

    # Pre-filter by price (cheap check before expensive scan)
    if min_price is not None:
        ticker_bars = {
            t: bars for t, bars in ticker_bars.items()
            if bars and bars[-1].close >= min_price
        }

    total_scanned = len(ticker_bars)
    # Scan each ticker for inside days
    hits: dict[str, dict] = {}
    for ticker, bars in ticker_bars.items():
        if len(bars) < 2:
            continue
        result = scan_ticker_for_inside_days(bars)
        if result is not None:
            hits[ticker] = result
    # Post-scan filters (volume, ATR) — applied before expensive ticker_details fetch
    if min_avg_volume is not None:
        hits = {
            t: s for t, s in hits.items()
            if s.get("avg_volume") is not None and s["avg_volume"] >= min_avg_volume
        }
    if min_relative_volume is not None:
        hits = {
            t: s for t, s in hits.items()
            if s.get("relative_volume") is not None and s["relative_volume"] >= min_relative_volume
        }
    if min_atr_pct is not None:
        hits = {
            t: s for t, s in hits.items()
            if s.get("atr_pct") is not None and s["atr_pct"] >= min_atr_pct
        }

    total_with_inside_days = len(hits)
    # Fetch details only for tickers with inside days
    details: dict[str, dict] = {}
    if hits:
        details = await fetch_ticker_details_batch(http, list(hits.keys()))
    # Build result items with market cap + ETF filtering
    items: list[BulkInsideDayItem] = []
    for ticker, scan in hits.items():
        detail = details.get(ticker, {})
        cap = detail.get("market_cap")
        ticker_type = detail.get("type")
        if min_cap is not None and (cap is None or cap < min_cap):
            continue
        if max_cap is not None and (cap is None or cap > max_cap):
            continue
        if exclude_etfs and ticker_type and ticker_type.upper() in ("ETF", "ETN"):
            continue
        items.append(BulkInsideDayItem(
            ticker=ticker,
            name=detail.get("name"),
            consecutive_inside_days=scan["consecutive_inside_days"],
            compression_pct=scan["compression_pct"],
            mother_bar_date=scan["mother_bar_date"],
            latest_close=scan["latest_close"],
            market_cap=cap,
            inside_day_dates=scan["inside_day_dates"],
            avg_volume=scan.get("avg_volume"),
            today_volume=scan.get("today_volume"),
            relative_volume=scan.get("relative_volume"),
            atr_pct=scan.get("atr_pct"),
            ticker_type=ticker_type,
        ))
    # Sort: most consecutive inside days first, then tightest compression
    items.sort(
        key=lambda x: (
            -x.consecutive_inside_days,
            x.compression_pct if x.compression_pct is not None else float("inf"),
        ),
    )
    return BulkInsideDayResult(
        results=items,
        total_scanned=total_scanned,
        total_with_inside_days=total_with_inside_days,
        scan_date=date.today().strftime("%Y-%m-%d"),
        preset=preset,
    )
