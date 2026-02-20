from fastapi import APIRouter

from app.data.mock_data import ECONOMIC_DATA
from app.schemas.models import EconomicDataPoint

router = APIRouter()


@router.get("/economic-data", response_model=list[EconomicDataPoint])
def get_economic_data() -> list[EconomicDataPoint]:
    return ECONOMIC_DATA
