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


def compute_atr(bars: list[DailyBar], period: int = 14) -> float | None:
    """Compute Average True Range as a percentage of the latest close.

    Requires at least period + 1 bars (to get `period` true-range values).
    Returns ATR as pct of latest close, or None if insufficient data.
    """
    if len(bars) < period + 1:
        return None

    true_ranges: list[float] = []
    for i in range(len(bars) - period, len(bars)):
        h = bars[i].high
        l = bars[i].low
        prev_c = bars[i - 1].close
        tr = max(h - l, abs(h - prev_c), abs(l - prev_c))
        true_ranges.append(tr)

    atr = sum(true_ranges) / len(true_ranges)
    latest_close = bars[-1].close
    if latest_close <= 0:
        return None
    return round((atr / latest_close) * 100, 2)


def compute_avg_volume(bars: list[DailyBar]) -> float:
    """Compute average daily volume across all provided bars."""
    if not bars:
        return 0
    return sum(b.volume for b in bars) / len(bars)


def scan_ticker_for_inside_days(bars: list[DailyBar]) -> dict | None:
    """Run inside day analysis on a list of bars.

    Returns result dict if consecutive > 0, else None.
    """
    consecutive, inside_dates = count_inside_days(bars)
    if consecutive <= 0:
        return None
    mother_bar_date, compression_pct = compute_compression(bars, consecutive)
    return {
        "consecutive_inside_days": consecutive,
        "inside_day_dates": inside_dates,
        "mother_bar_date": mother_bar_date,
        "compression_pct": compression_pct,
        "latest_close": bars[-1].close,
        "avg_volume": round(compute_avg_volume(bars[:-1])) if len(bars) > 1 else 0,
        "today_volume": round(bars[-1].volume),
        "relative_volume": round(bars[-1].volume / compute_avg_volume(bars[:-1]), 2) if len(bars) > 1 and compute_avg_volume(bars[:-1]) > 0 else None,
        "atr_pct": compute_atr(bars),
    }
