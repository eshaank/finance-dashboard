"""Unit tests for the scanner service — count_inside_days."""

from app.domains.market.client import DailyBar
from app.domains.scanner.service import count_inside_days


def _bar(date: str, high: float, low: float) -> DailyBar:
    """Helper to build a DailyBar with only the fields under test."""
    return DailyBar(date=date, open=low, high=high, low=low, close=high)


class TestCountInsideDays:
    def test_no_inside_days(self) -> None:
        """Each bar has a wider range than the previous — no inside days."""
        bars = [
            _bar("2025-01-01", high=110, low=90),
            _bar("2025-01-02", high=120, low=80),
            _bar("2025-01-03", high=130, low=70),
        ]
        count, dates = count_inside_days(bars)

        assert count == 0
        assert dates == []

    def test_two_consecutive_inside_days(self) -> None:
        """Two bars that fit inside the mother bar preceding them."""
        bars = [
            _bar("2025-01-01", high=100, low=50),   # mother bar
            _bar("2025-01-02", high=90, low=60),     # inside day 1
            _bar("2025-01-03", high=85, low=65),     # inside day 2
        ]
        count, dates = count_inside_days(bars)

        assert count == 2
        assert dates == ["2025-01-02", "2025-01-03"]

    def test_single_bar_returns_zero(self) -> None:
        """A single bar cannot form an inside-day pattern."""
        bars = [_bar("2025-01-01", high=100, low=90)]
        count, dates = count_inside_days(bars)

        assert count == 0
        assert dates == []
