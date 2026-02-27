from app.domains.news.client import CompanyNews
from app.domains.news.schemas import CompanyNewsItem, CompanyNewsResponse


def to_news_response(ticker: str, news_items: list[CompanyNews]) -> CompanyNewsResponse:
    return CompanyNewsResponse(
        ticker=ticker,
        results=[
            CompanyNewsItem(
                id=item.id,
                title=item.title,
                author=item.author,
                published_utc=item.published_utc,
                article_url=item.article_url,
                tickers=item.tickers,
                description=item.description,
                keywords=item.keywords,
                amp_url=item.amp_url,
                image_url=item.image_url,
            )
            for item in news_items
        ],
    )
