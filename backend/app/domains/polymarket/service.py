from collections import defaultdict

from app.domains.polymarket.schemas import (
    CategoryBreakdown,
    PolymarketEvent,
    PolymarketMarket,
    PolymarketStats,
)


def _parse_float(val: object, default: float = 0.0) -> float:
    try:
        return float(val) if val is not None else default
    except (ValueError, TypeError):
        return default


def _parse_prices(raw: str | list | None) -> list[float]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [_parse_float(p) for p in raw]
    try:
        import json
        parsed = json.loads(raw)
        return [_parse_float(p) for p in parsed] if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def _parse_outcomes(raw: str | list | None) -> list[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(o) for o in raw]
    try:
        import json
        parsed = json.loads(raw)
        return [str(o) for o in parsed] if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def raw_market_to_schema(raw: dict) -> PolymarketMarket:
    return PolymarketMarket(
        id=str(raw.get("id", "")),
        question=raw.get("question", ""),
        outcomes=_parse_outcomes(raw.get("outcomes")),
        outcome_prices=_parse_prices(raw.get("outcomePrices")),
        volume=_parse_float(raw.get("volume")),
        liquidity=_parse_float(raw.get("liquidity")),
        active=bool(raw.get("active", True)),
        closed=bool(raw.get("closed", False)),
        end_date=raw.get("endDate"),
    )


# Primary category slugs we recognize, in priority order
_PRIMARY_CATEGORY_SLUGS = {"politics", "crypto", "sports", "pop-culture", "science"}

# Slug -> display label
_CATEGORY_LABELS = {
    "politics": "Politics",
    "crypto": "Crypto",
    "sports": "Sports",
    "pop-culture": "Culture",
    "science": "Science",
}


def _extract_category(tags: list[dict]) -> str | None:
    """Pick the best primary category from the tags array."""
    for tag in tags:
        slug = tag.get("slug", "")
        if slug in _PRIMARY_CATEGORY_SLUGS:
            return _CATEGORY_LABELS.get(slug, tag.get("label", slug))
    # Fallback: use the first tag with forceShow=True, or the first tag label
    for tag in tags:
        if tag.get("forceShow"):
            return tag.get("label")
    return tags[0].get("label") if tags else None


def raw_event_to_schema(raw: dict) -> PolymarketEvent:
    raw_markets = raw.get("markets", []) or []
    markets = [raw_market_to_schema(m) for m in raw_markets]

    tags = raw.get("tags", []) or []
    category = _extract_category(tags) if tags else (raw.get("category") or raw.get("tag"))

    return PolymarketEvent(
        id=str(raw.get("id", "")),
        slug=raw.get("slug", ""),
        title=raw.get("title", ""),
        description=raw.get("description"),
        category=category,
        image=raw.get("image"),
        volume=_parse_float(raw.get("volume")),
        volume_24hr=_parse_float(raw.get("volume24hr")),
        liquidity=_parse_float(raw.get("liquidity")),
        open_interest=_parse_float(raw.get("openInterest")),
        markets=markets,
    )


def extract_trending(events: list[PolymarketEvent], count: int = 8) -> list[PolymarketEvent]:
    sorted_events = sorted(events, key=lambda e: e.volume_24hr, reverse=True)
    return sorted_events[:count]


def compute_stats(events: list[PolymarketEvent]) -> PolymarketStats:
    active_markets = 0
    total_volume_24hr = 0.0
    total_open_interest = 0.0
    total_liquidity = 0.0
    cat_counts: dict[str, int] = defaultdict(int)
    cat_volumes: dict[str, float] = defaultdict(float)

    for event in events:
        active_markets += len([m for m in event.markets if m.active and not m.closed])
        total_volume_24hr += event.volume_24hr
        total_open_interest += event.open_interest
        total_liquidity += event.liquidity

        cat = event.category or "Other"
        cat_counts[cat] += 1
        cat_volumes[cat] += event.volume_24hr

    categories = sorted(
        [
            CategoryBreakdown(name=name, count=cat_counts[name], volume_24hr=cat_volumes[name])
            for name in cat_counts
        ],
        key=lambda c: c.count,
        reverse=True,
    )

    return PolymarketStats(
        active_markets=active_markets,
        total_volume_24hr=total_volume_24hr,
        total_open_interest=total_open_interest,
        total_liquidity=total_liquidity,
        categories=categories,
    )
