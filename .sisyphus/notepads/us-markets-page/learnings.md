- Implemented useDividends hook in frontend/src/hooks/useDividends.ts
  - Follows existing hook pattern (useSWR + apiFetcher)
  - Returns { data, loading, error } to align with other hooks (e.g., useCompany)
  - Handles null/empty ticker by skipping the API call
  - Endpoint: GET /api/v1/fundamentals/dividends?ticker=
  - Data type is currently any[] (adjust with backend response when available)

- Read and mirrored conventions from:
  - frontend/src/hooks/useCompany.ts
  - frontend/src/lib/swr.ts (apiFetcher)

- Considerations for future work:
  - Introduce a Dividend type when API response shape is known
  - Add unit tests for hook behavior (loading, error, null ticker)
- Align with any global SWR config if needed

- Implemented useTechnicalIndicator hook in frontend/src/hooks/useTechnicalIndicator.ts
  - Follows existing hook pattern (useSWR + apiFetcher)
  - Returns { data, loading, error } to align with other hooks (e.g., useCompany)
  - Accepts type: 'sma' | 'ema' | 'rsi' | 'macd'
  - Handles null ticker by skipping the API call
  - Endpoint: GET /api/v1/technical/{type}?ticker=
  - Data type inferred as TechnicalIndicatorPoint[] (date, value)
  - No UI changes; ready for component integration
