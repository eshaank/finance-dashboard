import asyncio
import logging

import httpx

from app.domains.economics import client as massive_client
from app.domains.economics.schemas import EconomicDataPoint, UpcomingEvent
from app.domains.fred.service import get_fred_economic_data, get_fred_upcoming_events

logger = logging.getLogger(__name__)


def _derive_status(actual: float | None, previous: float | None) -> str:
    if actual is None or previous is None:
        return "pending"
    if actual > previous:
        return "beat"
    if actual < previous:
        return "missed"
    return "inline"


def _make_point(
    id_slug: str, indicator: str, date: str, unit: str,
    actual: float | None, previous: float | None,
    category: str = "",
) -> EconomicDataPoint:
    return EconomicDataPoint(
        id=id_slug,
        indicator=indicator,
        country="US",
        previous=previous,
        forecast=None,
        actual=actual,
        status=_derive_status(actual, previous),
        date=date,
        unit=unit,
        category=category,
    )


def _extract_fields(
    rows: list[dict], field: str, indicator: str, id_slug: str, unit: str,
    category: str = "",
) -> EconomicDataPoint | None:
    if not rows:
        return None
    actual = rows[0].get(field)
    previous = rows[1].get(field) if len(rows) > 1 else None
    date = rows[0].get("date", "")
    if actual is None and previous is None:
        return None
    return _make_point(id_slug, indicator, date, unit, actual, previous, category)


async def _get_massive_economic_data(client: httpx.AsyncClient) -> list[EconomicDataPoint]:
    results = await asyncio.gather(
        massive_client.get_inflation(client),
        massive_client.get_treasury_yields(client),
        massive_client.get_inflation_expectations(client),
        massive_client.get_labor_market(client),
        return_exceptions=True,
    )

    points: list[EconomicDataPoint] = []

    # Inflation
    inflation = results[0]
    if not isinstance(inflation, Exception):
        for field, indicator, slug in [
            ("cpi", "US CPI", "massive-cpi"),
            ("cpi_year_over_year", "US CPI (YoY)", "massive-cpi-yoy"),
            ("pce", "US PCE Price Index", "massive-pce"),
            ("pce_core", "US Core PCE", "massive-pce-core"),
        ]:
            pt = _extract_fields(inflation, field, indicator, slug, "%", "inflation")
            if pt:
                points.append(pt)
    else:
        logger.warning("Massive inflation failed: %s", inflation)

    # Treasury yields
    yields = results[1]
    if not isinstance(yields, Exception):
        for field, indicator, slug in [
            ("yield_2_year", "US Treasury 2Y", "massive-t2y"),
            ("yield_10_year", "US Treasury 10Y", "massive-t10y"),
            ("yield_30_year", "US Treasury 30Y", "massive-t30y"),
        ]:
            pt = _extract_fields(yields, field, indicator, slug, "%", "yields")
            if pt:
                points.append(pt)
    else:
        logger.warning("Massive treasury yields failed: %s", yields)

    # Inflation expectations
    expectations = results[2]
    if not isinstance(expectations, Exception):
        for field, indicator, slug in [
            ("market_5_year", "US 5Y Breakeven Inflation", "massive-be5y"),
            ("market_10_year", "US 10Y Breakeven Inflation", "massive-be10y"),
        ]:
            pt = _extract_fields(expectations, field, indicator, slug, "%", "expectations")
            if pt:
                points.append(pt)
    else:
        logger.warning("Massive inflation expectations failed: %s", expectations)

    # Labor market
    labor = results[3]
    if not isinstance(labor, Exception):
        for field, indicator, slug, unit in [
            ("unemployment_rate", "US Unemployment Rate", "massive-unemp", "%"),
            ("labor_force_participation_rate", "US Labor Force Participation", "massive-lfpr", "%"),
            ("job_openings", "US Job Openings", "massive-jolts", "K"),
        ]:
            pt = _extract_fields(labor, field, indicator, slug, unit, "employment")
            if pt:
                points.append(pt)
    else:
        logger.warning("Massive labor market failed: %s", labor)

    return points


async def get_economic_data(client: httpx.AsyncClient) -> list[EconomicDataPoint]:
    fred_task = get_fred_economic_data(client)
    massive_task = _get_massive_economic_data(client)

    results = await asyncio.gather(fred_task, massive_task, return_exceptions=True)

    all_points: list[EconomicDataPoint] = []
    for result in results:
        if isinstance(result, Exception):
            logger.warning("Economic data source failed: %s", result)
            continue
        all_points.extend(result)

    all_points.sort(key=lambda p: p.date, reverse=True)
    return all_points


async def get_upcoming_events(client: httpx.AsyncClient) -> list[UpcomingEvent]:
    events = await get_fred_upcoming_events(client)
    events.sort(key=lambda e: e.daysUntil)
    return events
