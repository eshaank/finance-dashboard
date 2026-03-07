from app.domains.corporate_actions.client import DividendInfo, SplitInfo
from app.domains.corporate_actions.schemas import (
    DividendHistoryItem,
    DividendHistoryResponse,
    SplitHistoryItem,
    SplitHistoryResponse,
)

_FREQUENCY_MAP = {1: "A", 2: "S", 4: "Q", 12: "M"}


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


from app.domains.corporate_actions.client import DividendItem as DividendItemDC, IpoItem as IpoItemDC, SplitItem as SplitItemDC
from app.domains.corporate_actions.schemas import (
    DividendItem as DividendItemSchema,
    IpoItem as IpoItemSchema,
    SplitItem as SplitItemSchema,
)


def split_item_to_schema(item: SplitItemDC) -> SplitItemSchema:
    return SplitItemSchema(
        ticker=item.ticker,
        execution_date=item.execution_date,
        split_from=item.split_from,
        split_to=item.split_to,
        is_reverse=item.split_from > item.split_to,
    )


def dividend_item_to_schema(item: DividendItemDC) -> DividendItemSchema:
    return DividendItemSchema(
        ticker=item.ticker,
        ex_dividend_date=item.ex_dividend_date,
        record_date=item.record_date,
        pay_date=item.pay_date,
        declaration_date=item.declaration_date,
        amount=item.amount,
        frequency=item.frequency,
    )


def ipo_item_to_schema(item: IpoItemDC) -> IpoItemSchema:
    return IpoItemSchema(
        ticker=item.ticker,
        issuer_name=item.issuer_name,
        offer_amount=item.offer_amount,
        share_price=item.share_price,
        share_price_from=item.share_price_from,
        share_price_to=item.share_price_to,
        shares=item.shares,
        listing_date=item.listing_date,
        status=item.status,
    )
