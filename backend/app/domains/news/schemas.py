from pydantic import BaseModel


class CompanyNewsItem(BaseModel):
    id: str
    title: str
    author: str | None = None
    published_utc: str
    article_url: str
    tickers: list[str]
    description: str | None = None
    keywords: list[str] | None = None
    amp_url: str | None = None
    image_url: str | None = None


class CompanyNewsResponse(BaseModel):
    ticker: str
    results: list[CompanyNewsItem]


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
