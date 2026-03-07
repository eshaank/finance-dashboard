from pydantic import BaseModel


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


class SplitItem(BaseModel):
    ticker: str
    execution_date: str
    split_from: float
    split_to: float
    is_reverse: bool


class DividendItem(BaseModel):
    ticker: str
    ex_dividend_date: str
    record_date: str | None = None
    pay_date: str | None = None
    declaration_date: str | None = None
    amount: float
    frequency: int


class IpoItem(BaseModel):
    ticker: str
    issuer_name: str
    offer_amount: float | None = None
    share_price: float | None = None
    share_price_from: float | None = None
    share_price_to: float | None = None
    shares: int | None = None
    listing_date: str
    status: str
