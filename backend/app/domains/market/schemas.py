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


class TickerQuote(BaseModel):
    ticker: str
    last: float
    change: float
    change_percent: float
    volume: float
    prev_close: float


class QuotesResult(BaseModel):
    quotes: list[TickerQuote]


class MarketNewsItem(BaseModel):
    id: str
    publisher_name: str
    publisher_homepage_url: str | None = None
    published_utc: str
    title: str
    description: str | None = None
    article_url: str
    tickers: list[str] = []
    image_url: str | None = None


class SplitItem(BaseModel):
    ticker: str
    execution_date: str
    split_from: float
    split_to: float
    is_reverse: bool


class DividendItem(BaseModel):
    ticker: str
    ex_dividend_date: str
    record_date: str | None = None
    pay_date: str | None = None
    declaration_date: str | None = None
    amount: float
    frequency: int


class IpoItem(BaseModel):
    ticker: str
    issuer_name: str
    offer_amount: float | None = None
    share_price: float | None = None
    share_price_from: float | None = None
    share_price_to: float | None = None
    shares: int | None = None
    listing_date: str
    status: str
