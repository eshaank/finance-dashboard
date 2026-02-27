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


class DividendHistoryItem(BaseModel):
    ticker: str
    ex_dividend_date: str
    record_date: str | None = None
    pay_date: str | None = None
    declaration_date: str | None = None
    cash_amount: float
    frequency: str | None = None


class SplitHistoryItem(BaseModel):
    ticker: str
    execution_date: str
    split_from: int
    split_to: int
    is_reverse: bool


class DividendHistoryResponse(BaseModel):
    ticker: str
    results: list[DividendHistoryItem]


class SplitHistoryResponse(BaseModel):
    ticker: str
    results: list[SplitHistoryItem]
