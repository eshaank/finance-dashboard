from fastapi import APIRouter

from app.data.mock_data import MARKET_INDICES
from app.schemas.models import MarketIndex

router = APIRouter()


@router.get("/market-indices", response_model=list[MarketIndex])
def get_market_indices() -> list[MarketIndex]:
    return MARKET_INDICES
