from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.data.mock_data import MARKET_INDICES
from app.schemas.models import MarketIndex

router = APIRouter()


@router.get("/market-indices", response_model=list[MarketIndex])
def get_market_indices(_user: dict = Depends(get_current_user)) -> list[MarketIndex]:
    return MARKET_INDICES
