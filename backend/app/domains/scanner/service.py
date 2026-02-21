from app.domains.market.client import DailyBar


def count_inside_days(bars: list[DailyBar]) -> tuple[int, list[str]]:
    """Count consecutive inside days ending at the most recent bar.

    All inside-day bars are compared against the same mother bar (the bar that
    started the pattern), not against each other sequentially. This correctly
    handles the case where individual inside bars vary in size while all
    remaining within the mother bar's range.
    """
    n = len(bars)
    if n < 2:
        return 0, []

    effective_high = bars[-1].high
    effective_low = bars[-1].low
    count = 0

    for i in range(n - 2, -1, -1):
        curr = bars[i]
        if curr.high > effective_high and curr.low < effective_low:
            count = n - 1 - i
        effective_high = max(effective_high, curr.high)
        effective_low = min(effective_low, curr.low)

    dates = [b.date for b in bars[n - count:]] if count > 0 else []
    return count, dates


def compute_compression(bars: list[DailyBar], consecutive: int) -> tuple[str | None, float | None]:
    """Compute mother bar date and compression percentage."""
    if consecutive <= 0:
        return None, None

    streak_start_idx = len(bars) - consecutive - 1
    if streak_start_idx < 0:
        return None, None

    mother = bars[streak_start_idx]
    mother_range = mother.high - mother.low
    latest_range = bars[-1].high - bars[-1].low
    compression_pct = round((latest_range / mother_range) * 100, 1) if mother_range > 0 else None

    return mother.date, compression_pct
