from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.data.mock_data import MARKET_INDICES
from app.domains.market.client import fetch_candles
from app.domains.market.schemas import MarketIndex, PriceChartResult
from app.domains.market.service import bars_to_ohlc, validate_timeframe

router = APIRouter()


@router.get("/market-indices", response_model=list[MarketIndex])
async def get_market_indices(_user: dict = Depends(get_current_user)) -> list[MarketIndex]:
    return MARKET_INDICES


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
