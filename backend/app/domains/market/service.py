from app.domains.market.client import (
    CHART_TIMEFRAMES,
    DailyBar,
    DividendItem,
    IpoItem,
    MarketNewsItem,
    SplitItem,
)
from app.domains.market.schemas import (
    DividendItem as DividendItemSchema,
    IpoItem as IpoItemSchema,
    MarketNewsItem as MarketNewsItemSchema,
    OHLCBar,
    SplitItem as SplitItemSchema,
)

ALLOWED_TIMEFRAMES = list(CHART_TIMEFRAMES.keys())


def validate_timeframe(timeframe: str) -> None:
    if timeframe not in ALLOWED_TIMEFRAMES:
        raise ValueError(f"Invalid timeframe '{timeframe}'. Allowed: {ALLOWED_TIMEFRAMES}")


def bars_to_ohlc(bars: list[DailyBar]) -> list[OHLCBar]:
    return [OHLCBar(date=b.date, open=b.open, high=b.high, low=b.low, close=b.close, volume=b.volume) for b in bars]


def news_item_to_schema(item: MarketNewsItem) -> MarketNewsItemSchema:
    """Convert MarketNewsItem dataclass to Pydantic schema."""
    return MarketNewsItemSchema(
        id=item.id,
        publisher_name=item.publisher_name,
        publisher_homepage_url=item.publisher_homepage_url,
        published_utc=item.published_utc,
        title=item.title,
        description=item.description,
        article_url=item.article_url,
        tickers=item.tickers,
        image_url=item.image_url,
    )


def split_item_to_schema(item: SplitItem) -> SplitItemSchema:
    """Convert SplitItem dataclass to Pydantic schema with is_reverse computed field."""
    return SplitItemSchema(
        ticker=item.ticker,
        execution_date=item.execution_date,
        split_from=item.split_from,
        split_to=item.split_to,
        is_reverse=item.split_from > item.split_to,
    )


def dividend_item_to_schema(item: DividendItem) -> DividendItemSchema:
    """Convert DividendItem dataclass to Pydantic schema."""
    return DividendItemSchema(
        ticker=item.ticker,
        ex_dividend_date=item.ex_dividend_date,
        record_date=item.record_date,
        pay_date=item.pay_date,
        declaration_date=item.declaration_date,
        amount=item.amount,
        frequency=item.frequency,
    )


def ipo_item_to_schema(item: IpoItem) -> IpoItemSchema:
    """Convert IpoItem dataclass to Pydantic schema."""
    return IpoItemSchema(
        ticker=item.ticker,
        issuer_name=item.issuer_name,
        offer_amount=item.offer_amount,
        share_price=item.share_price,
        share_price_from=item.share_price_from,
        share_price_to=item.share_price_to,
        shares=item.shares,
        listing_date=item.listing_date,
        status=item.status,
    )
