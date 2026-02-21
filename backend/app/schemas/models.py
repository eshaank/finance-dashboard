from typing import Literal
from pydantic import BaseModel


class MarketIndex(BaseModel):
    id: str
    ticker: str
    name: str
    price: float
    change: float
    changePercent: float
    exchange: str
    trend: Literal["up", "down"]


class EconomicDataPoint(BaseModel):
    id: str
    indicator: str
    country: str
    previous: float | None
    forecast: float | None
    actual: float | None
    status: Literal["beat", "missed", "inline", "pending"]
    date: str
    unit: str


class UpcomingEvent(BaseModel):
    id: str
    name: str
    datetime: str
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    category: str
    daysUntil: int


class OHLCBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float


class InsideDayResult(BaseModel):
    ticker: str
    consecutive_inside_days: int
    inside_day_dates: list[str]
    mother_bar_date: str | None
    latest_close: float
    compression_pct: float | None
    bars: list[OHLCBar]  # last 30 bars, oldest → newest


class BalanceSheetEntry(BaseModel):
    period_end: str
    tickers: list[str] = []
    timeframe: str | None = None
    fiscal_year: int | None = None
    fiscal_quarter: int | None = None
    total_assets: float | None = None
    total_liabilities: float | None = None
    total_equity: float | None = None
    cash_and_equivalents: float | None = None
    long_term_debt_and_capital_lease_obligations: float | None = None


class CashFlowEntry(BaseModel):
    period_end: str
    tickers: list[str] = []
    timeframe: str | None = None
    fiscal_year: int | None = None
    fiscal_quarter: int | None = None
    net_cash_from_operating_activities: float | None = None
    purchase_of_property_plant_and_equipment: float | None = None
    net_cash_from_investing_activities: float | None = None
    net_cash_from_financing_activities: float | None = None


class IncomeStatementEntry(BaseModel):
    period_end: str
    tickers: list[str] = []
    timeframe: str | None = None
    fiscal_year: int | None = None
    fiscal_quarter: int | None = None
    revenue: float | None = None
    gross_profit: float | None = None
    operating_income: float | None = None
    consolidated_net_income_loss: float | None = None
    diluted_earnings_per_share: float | None = None
    ebitda: float | None = None


class RatiosEntry(BaseModel):
    ticker: str
    date: str
    price_to_earnings: float | None = None
    price_to_book: float | None = None
    debt_to_equity: float | None = None
    current: float | None = None
    return_on_equity: float | None = None
    return_on_assets: float | None = None
    market_cap: float | None = None


class ShortInterestEntry(BaseModel):
    ticker: str
    settlement_date: str
    short_interest: int | None = None
    days_to_cover: float | None = None
    avg_daily_volume: int | None = None


class ShortVolumeEntry(BaseModel):
    ticker: str
    date: str
    short_volume: int | None = None
    total_volume: int | None = None
    short_volume_ratio: float | None = None


class FloatData(BaseModel):
    ticker: str
    free_float: int | None = None
    free_float_percent: float | None = None
    effective_date: str | None = None


class PriceChartResult(BaseModel):
    ticker: str
    timeframe: str
    bars: list[OHLCBar]
    latest_close: float


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
