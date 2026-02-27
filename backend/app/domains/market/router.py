import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.data.mock_data import MARKET_INDICES
from app.domains.market.client import (
    fetch_candles,
    fetch_market_news,
    fetch_recent_ipos,
    fetch_snapshot_quotes,
    fetch_upcoming_dividends,
    fetch_upcoming_splits,
)
from app.domains.market.schemas import (
    DividendItem,
    IpoItem,
    MarketIndex,
    MarketNewsItem,
    PriceChartResult,
    QuotesResult,
    SplitItem,
    TickerQuote,
)
from app.domains.market.service import (
    bars_to_ohlc,
    dividend_item_to_schema,
    ipo_item_to_schema,
    news_item_to_schema,
    split_item_to_schema,
    validate_timeframe,
)

logger = logging.getLogger(__name__)
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


@router.get("/market/news", response_model=list[MarketNewsItem])
async def get_market_news(
    request: Request,
    limit: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[MarketNewsItem]:
    """Fetch general market news articles."""
    try:
        items = await fetch_market_news(request.app.state.http_client, limit)
        return [news_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch market news")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/market/upcoming-splits", response_model=list[SplitItem])
async def get_upcoming_splits(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[SplitItem]:
    """Fetch stock splits scheduled for the next 30 days."""
    try:
        items = await fetch_upcoming_splits(request.app.state.http_client)
        return [split_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch upcoming splits")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/market/upcoming-dividends", response_model=list[DividendItem])
async def get_upcoming_dividends(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[DividendItem]:
    """Fetch dividends with ex-dividend dates in the next 30 days."""
    try:
        items = await fetch_upcoming_dividends(request.app.state.http_client)
        return [dividend_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch upcoming dividends")
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/market/recent-ipos", response_model=list[IpoItem])
async def get_recent_ipos(
    request: Request,
    _user: dict = Depends(get_current_user),
) -> list[IpoItem]:
    """Fetch IPOs from the last 90 days."""
    try:
        items = await fetch_recent_ipos(request.app.state.http_client)
        return [ipo_item_to_schema(item) for item in items]
    except Exception as exc:
        logger.exception("Failed to fetch recent IPOs")
        raise HTTPException(status_code=502, detail="External API error") from exc
