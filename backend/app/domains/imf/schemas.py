"""Pydantic schemas for IMF data API responses."""

from pydantic import BaseModel


class IMFSeriesObservation(BaseModel):
    """Single observation (e.g. one country/year) from an IMF dataset."""

    country_code: str
    country_name: str
    indicator_code: str
    indicator_name: str
    year: int
    value: float | None = None
    unit: str | None = None


class IMFDataSetSummary(BaseModel):
    """Summary of an IMF dataset (e.g. WEO, IFS) for listing."""

    dataset_id: str
    name: str
    description: str | None = None


# --- US Company Layoffs (dashboard card) ---


class CompanyLayoffEvent(BaseModel):
    """Single layoff event row for the US Company Layoffs card."""

    company: str
    layoff_count: int
    department: str
    date: str  # e.g. "Nov 2025"
    reason: str
    logo_url: str | None = None  # optional for UI (e.g. company logo)


class USCompanyLayoffsCard(BaseModel):
    """Payload for the US Company Layoffs dashboard card."""

    category: str = "Business"  # pill tag, e.g. "Business"
    events: list[CompanyLayoffEvent]
    total_events: int
    status: str = "Active"  # e.g. "Active" with green dot
    data_freshness: str = "Real-time"  # e.g. "Real-time" with lightning icon
    last_updated: str | None = None  # e.g. "13m ago"
