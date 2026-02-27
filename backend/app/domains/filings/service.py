from app.domains.filings.client import SecFiling
from app.domains.filings.schemas import SecFilingItem, SecFilingsResponse


def to_filings_response(ticker: str, cik: str | None, filings: list[SecFiling]) -> SecFilingsResponse:
    return SecFilingsResponse(
        ticker=ticker,
        cik=cik,
        results=[
            SecFilingItem(
                ticker=item.ticker,
                cik=item.cik,
                filing_type=item.filing_type,
                filing_date=item.filing_date,
                period_of_report_date=item.period_of_report_date,
                description=item.description,
                link=item.link,
            )
            for item in filings
        ],
    )
