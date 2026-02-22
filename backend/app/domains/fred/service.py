import asyncio
import logging
from datetime import date, datetime

import httpx

from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent
from app.domains.fred.client import (
    FRED_SERIES,
    fetch_release_dates,
    fetch_series_observations,
)

logger = logging.getLogger(__name__)


def _parse_fred_value(value: str) -> float | None:
    if not value or value == ".":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _derive_status(actual: float | None, previous: float | None) -> str:
    if actual is None:
        return "pending"
    if previous is None:
        return "pending"
    if actual > previous:
        return "beat"
    if actual < previous:
        return "missed"
    return "inline"


async def get_fred_economic_data(client: httpx.AsyncClient) -> list[EconomicDataPoint]:
    tasks = {
        sid: fetch_series_observations(client, sid)
        for sid in FRED_SERIES
    }
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)

    data_points: list[EconomicDataPoint] = []
    for sid, result in zip(tasks.keys(), results):
        if isinstance(result, Exception):
            logger.warning("FRED series %s failed: %s", sid, result)
            continue

        obs = result
        if not obs:
            continue

        name, unit, category = FRED_SERIES[sid]
        actual = _parse_fred_value(obs[0].get("value", ""))
        previous = _parse_fred_value(obs[1].get("value", "")) if len(obs) > 1 else None
        obs_date = obs[0].get("date", "")

        data_points.append(EconomicDataPoint(
            id=f"fred-{sid.lower()}",
            indicator=name,
            country="US",
            previous=previous,
            forecast=None,
            actual=actual,
            status=_derive_status(actual, previous),
            date=obs_date,
            unit=unit,
            category=category,
        ))

    return data_points


_HIGH_KEYWORDS = {"gdp", "cpi", "fomc", "employment", "nonfarm", "payroll", "pce"}
_MEDIUM_KEYWORDS = {"retail", "housing", "consumer", "industrial", "trade"}

_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "employment": ["employment", "labor", "payroll", "jobless", "claims", "job"],
    "inflation": ["cpi", "pce", "inflation", "price index"],
    "growth": ["gdp", "production", "industrial", "durable goods", "factory"],
    "consumer": ["retail", "consumer", "sentiment", "spending", "confidence"],
    "housing": ["housing", "home", "construction", "building permit", "mortgage"],
    "central_bank": ["fomc", "fed", "monetary", "interest rate", "federal reserve"],
    "bonds": ["treasury", "bond", "yield", "auction", "debt"],
    "business": ["pmi", "ism", "business", "inventory", "trade balance", "survey"],
    "speeches": ["speaks", "speech", "testimony", "press conference", "chairman"],
}


def _classify_priority(name: str) -> str:
    lower = name.lower()
    if any(kw in lower for kw in _HIGH_KEYWORDS):
        return "HIGH"
    if any(kw in lower for kw in _MEDIUM_KEYWORDS):
        return "MEDIUM"
    return "LOW"


def _classify_category(name: str) -> str:
    lower = name.lower()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return category
    return "other"


async def get_fred_upcoming_events(client: httpx.AsyncClient) -> list[UpcomingEvent]:
    releases = await fetch_release_dates(client)
    today = date.today()
    events: list[UpcomingEvent] = []

    for release in releases:
        release_date_str = release.get("date", "")
        try:
            release_date = datetime.strptime(release_date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            continue

        if release_date < today:
            continue

        name = release.get("release_name", "Unknown Release")
        days_until = (release_date - today).days
        release_id = release.get("release_id", 0)

        events.append(UpcomingEvent(
            id=f"fred-release-{release_id}",
            name=name,
            datetime=f"{release_date_str}T12:00:00Z",
            priority=_classify_priority(name),
            category=_classify_category(name),
            daysUntil=days_until,
        ))

    return events
