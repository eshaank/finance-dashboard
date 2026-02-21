from pydantic import BaseModel


class CompanyDetailsResponse(BaseModel):
    ticker: str
    name: str
    description: str
    sic_description: str
    primary_exchange: str
    homepage_url: str | None = None
    total_employees: int | None = None
    market_cap: float | None = None
    logo_url: str | None = None
