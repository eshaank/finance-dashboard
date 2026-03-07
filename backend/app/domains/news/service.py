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


from app.domains.news.client import MarketNewsItem as MarketNewsItemDC
from app.domains.news.schemas import MarketNewsItem as MarketNewsItemSchema


def news_item_to_schema(item: MarketNewsItemDC) -> MarketNewsItemSchema:
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
