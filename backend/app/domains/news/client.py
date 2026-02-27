from dataclasses import dataclass
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_news_cache: TTLCache[str, list["CompanyNews"]] = TTLCache(maxsize=256, ttl=60)


@dataclass
class CompanyNews:
    id: str
    title: str
    author: str | None
    published_utc: str
    article_url: str
    tickers: list[str]
    description: str | None
    keywords: list[str] | None
    amp_url: str | None
    image_url: str | None


async def fetch_company_news(client: httpx.AsyncClient, ticker: str, limit: int = 20) -> list[CompanyNews]:
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    ticker_upper = ticker.upper()
    cache_key = f"{ticker_upper}:{limit}"
    if cache_key in _news_cache:
        return _news_cache[cache_key]

    from_date = date.today() - timedelta(days=365 * 2)
    url = f"https://api.polygon.io/v2/reference/news"
    params = {
        "ticker": ticker_upper,
        "limit": limit,
        "published_utc.gt": from_date.isoformat(),
        "apiKey": settings.massive_api_key,
    }

    response = await fetch_with_retry(client, "GET", url, params=params)
    data = response.json()
    results = data.get("results", [])

    news_list: list[CompanyNews] = []
    for r in results:
        news_item = CompanyNews(
            id=r.get("id", ""),
            title=r.get("title", ""),
            author=r.get("author"),
            published_utc=r.get("published_utc", ""),
            article_url=r.get("article_url", ""),
            tickers=r.get("tickers", []),
            description=r.get("description"),
            keywords=r.get("keywords"),
            amp_url=r.get("amp_url"),
            image_url=r.get("image_url"),
        )
        news_list.append(news_item)

    _news_cache[cache_key] = news_list
    return news_list
