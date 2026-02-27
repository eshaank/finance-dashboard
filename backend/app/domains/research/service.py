from app.domains.research.client import CompanyDetails, DividendInfo, SplitInfo
from app.domains.research.schemas import (
    CompanyDetailsResponse,
    DividendHistoryItem,
    DividendHistoryResponse,
    SplitHistoryItem,
    SplitHistoryResponse,
)

_FREQUENCY_MAP = {1: "A", 2: "S", 4: "Q", 12: "M"}


def to_response(details: CompanyDetails) -> CompanyDetailsResponse:
    return CompanyDetailsResponse(
        ticker=details.ticker,
        name=details.name,
        description=details.description,
        sic_description=details.sic_description,
        primary_exchange=details.primary_exchange,
        homepage_url=details.homepage_url,
        total_employees=details.total_employees,
        market_cap=details.market_cap,
        logo_url=details.logo_url,
    )


def to_dividend_response(ticker: str, dividends: list[DividendInfo]) -> DividendHistoryResponse:
    return DividendHistoryResponse(
        ticker=ticker,
        results=[
            DividendHistoryItem(
                ticker=item.ticker,
                ex_dividend_date=item.ex_date,
                record_date=item.record_date,
                pay_date=item.pay_date,
                declaration_date=item.declaration_date,
                cash_amount=item.amount,
                frequency=_FREQUENCY_MAP.get(item.frequency) if item.frequency else None,
            )
            for item in dividends
        ],
    )


def to_split_response(ticker: str, splits: list[SplitInfo]) -> SplitHistoryResponse:
    return SplitHistoryResponse(
        ticker=ticker,
        results=[
            SplitHistoryItem(
                ticker=item.ticker,
                execution_date=item.execution_date,
                split_from=item.split_from,
                split_to=item.split_to,
                is_reverse=item.split_to < item.split_from,
            )
            for item in splits
        ],
    )
