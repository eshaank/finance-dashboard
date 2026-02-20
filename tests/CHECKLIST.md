# Test Checklist

> Track which features have been tested and what still needs coverage.

## How to Use

Before marking a feature complete, verify it appears here with tests written.

| Feature | Unit Tests | Integration Tests | E2E Tests | Notes |
|---------|-----------|------------------|-----------|-------|
| (Add features as you build them) | | | | |

## Testing Standards

- Every test MUST have explicit assertions — "page loads" is NOT a success criterion
- Minimum 3 assertions per E2E test: URL, element visibility, data content
- Unit tests: test one thing, isolated, fast
- Integration tests: test service boundaries
- E2E tests: test complete user flows
