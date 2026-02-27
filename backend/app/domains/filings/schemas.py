from pydantic import BaseModel


class SecFilingItem(BaseModel):
    ticker: str
    cik: str
    filing_type: str
    filing_date: str
    period_of_report_date: str | None = None
    description: str | None = None
    link: str


class SecFilingsResponse(BaseModel):
    ticker: str
    cik: str | None = None
    results: list[SecFilingItem]
