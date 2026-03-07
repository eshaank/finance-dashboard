from app.domains.company.client import CompanyDetails
from app.domains.company.schemas import CompanyDetailsResponse


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
