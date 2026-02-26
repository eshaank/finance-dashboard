from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.data.mock_data import MARKET_INDICES
from app.domains.market.client import fetch_candles, fetch_snapshot_quotes
from app.domains.market.schemas import MarketIndex, PriceChartResult, QuotesResult, TickerQuote
from app.domains.market.service import bars_to_ohlc, validate_timeframe

router = APIRouter()


@router.get("/market-indices", response_model=list[MarketIndex])
async def get_market_indices(_user: dict = Depends(get_current_user)) -> list[MarketIndex]:
    return MARKET_INDICES


@router.get("/quotes", response_model=QuotesResult)
async def get_quotes(
    request: Request,
    tickers: str = Query(..., min_length=1),
    _user: dict = Depends(get_current_user),
) -> QuotesResult:
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail="No tickers provided")
    ticker_list = ticker_list[:50]

    snapshots = await fetch_snapshot_quotes(request.app.state.http_client, ticker_list)
    quotes = [
        TickerQuote(
            ticker=s.ticker,
            last=s.last,
            change=s.change,
            change_percent=s.change_percent,
            volume=s.volume,
            prev_close=s.prev_close,
        )
        for s in snapshots
    ]
    return QuotesResult(quotes=quotes)


@router.get("/price-chart", response_model=PriceChartResult)
async def get_price_chart(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    timeframe: str = Query("1M"),
    _user: dict = Depends(get_current_user),
) -> PriceChartResult:
    try:
        validate_timeframe(timeframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        bars = await fetch_candles(request.app.state.http_client, ticker, timeframe)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not bars:
        raise HTTPException(status_code=400, detail=f"No data for ticker '{ticker}'")

    return PriceChartResult(
        ticker=ticker.upper(),
        timeframe=timeframe,
        bars=bars_to_ohlc(bars),
        latest_close=bars[-1].close,
    )
