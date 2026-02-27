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
