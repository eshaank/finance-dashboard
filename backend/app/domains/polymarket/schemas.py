from pydantic import BaseModel


class PolymarketMarket(BaseModel):
    id: str
    question: str
    outcomes: list[str] = []
    outcome_prices: list[float] = []
    volume: float = 0
    liquidity: float = 0
    active: bool = True
    closed: bool = False
    end_date: str | None = None


class PolymarketEvent(BaseModel):
    id: str
    slug: str
    title: str
    description: str | None = None
    category: str | None = None
    image: str | None = None
    volume: float = 0
    volume_24hr: float = 0
    liquidity: float = 0
    open_interest: float = 0
    markets: list[PolymarketMarket] = []


class CategoryBreakdown(BaseModel):
    name: str
    count: int
    volume_24hr: float = 0


class PolymarketStats(BaseModel):
    active_markets: int = 0
    total_volume_24hr: float = 0
    total_open_interest: float = 0
    total_liquidity: float = 0
    categories: list[CategoryBreakdown] = []


class PolymarketEventsResponse(BaseModel):
    events: list[PolymarketEvent] = []
    trending: list[PolymarketEvent] = []
    total: int = 0
