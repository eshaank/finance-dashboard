from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.data.mock_data import ECONOMIC_DATA
from app.schemas.models import EconomicDataPoint

router = APIRouter()


@router.get("/economic-data", response_model=list[EconomicDataPoint])
def get_economic_data(_user: dict = Depends(get_current_user)) -> list[EconomicDataPoint]:
    return ECONOMIC_DATA
