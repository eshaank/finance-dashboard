# Architecture

> **This document is AUTHORITATIVE. No exceptions.**
> Read this before making cross-service changes.

---

## Overview

Finance Dashboard is a two-tier web application: a **React + Vite** frontend and a **FastAPI** backend. The backend proxies two external market-data APIs (Polygon.io and Massive) and serves the results over a REST JSON API. There is no database — all data is fetched on demand from external APIs or served from in-memory mock data.

```
Browser (React SPA)
   |
   |  HTTP GET (JSON)
   v
FastAPI Backend (:8000)
   |
   |  HTTPS GET
   v
Polygon.io API  /  Massive API
```

---

## Services

### Frontend — React + Vite (port 5173)

| Does | Does NOT |
|------|----------|
| Render dashboard UI (Overview, Scanner, Research) | Store any persistent data |
| Manage client-side state via React hooks | Perform server-side rendering |
| Call backend REST API via `api.ts` | Call external APIs directly |
| Handle timeframe/tab/section navigation | Authenticate users |

**Key paths:**
- `src/App.tsx` — Root component
- `src/components/layout/DashboardLayout.tsx` — Tab routing (Overview, Scanner, Research)
- `src/hooks/` — Data-fetching hooks (one per API resource)
- `src/lib/api.ts` — Centralized API client
- `src/types/index.ts` — Shared TypeScript interfaces

### Backend — FastAPI (port 8000)

| Does | Does NOT |
|------|----------|
| Proxy Polygon.io for price/company data | Store data in a database |
| Proxy Massive API for fundamentals/short data | Authenticate users |
| Detect inside-day patterns (algorithm in router) | Cache API responses (yet) |
| Serve mock data for market indices/events | Handle WebSocket connections |
| Validate query params and return typed JSON | Push notifications |

**Key paths:**
- `app/main.py` — FastAPI app + CORS + router registration
- `app/config.py` — Settings from environment variables
- `app/routers/` — One file per endpoint group
- `app/services/polygon.py` — Polygon.io API client
- `app/services/massive.py` — Massive API client
- `app/schemas/models.py` — Pydantic response models
- `app/data/mock_data.py` — Static mock data (indices, economic, events)

---

## API Endpoints

All routes are prefixed with `/api`:

| Method | Path | Router | External API | Purpose |
|--------|------|--------|--------------|---------|
| GET | `/market-indices` | market_indices | Mock data | SPY, QQQ, IWM, etc. |
| GET | `/economic-data` | economic_data | Mock data | Economic indicators |
| GET | `/upcoming-events` | upcoming_events | Mock data | Earnings, FOMC, etc. |
| GET | `/inside-days?ticker=` | inside_days | Polygon (daily bars) | Inside-day pattern detection |
| GET | `/price-chart?ticker=&timeframe=` | price_chart | Polygon (variable bars) | OHLC chart data (7 timeframes) |
| GET | `/company/details?ticker=` | company | Polygon (reference) | Company info + logo |
| GET | `/fundamentals/income-statement?ticker=` | fundamentals | Massive | Income statements |
| GET | `/fundamentals/balance-sheet?ticker=` | fundamentals | Massive | Balance sheets |
| GET | `/fundamentals/cash-flow?ticker=` | fundamentals | Massive | Cash flow statements |
| GET | `/fundamentals/ratios?ticker=` | fundamentals | Massive | Financial ratios |
| GET | `/fundamentals/short-interest?ticker=` | fundamentals | Massive | Short interest data |
| GET | `/fundamentals/short-volume?ticker=` | fundamentals | Massive | Short volume data |
| GET | `/fundamentals/float?ticker=` | fundamentals | Massive | Free float data |
| GET | `/health` | main | - | Health check |

---

## External API Integrations

### Polygon.io — Price Data + Company Info
- **Base URL:** `https://api.polygon.io`
- **Auth:** Query param `apiKey` (from `MASSIVE_API_KEY` env var)
- **Endpoints used:**
  - `GET /v3/reference/tickers/{ticker}` — Company details
  - `GET /v2/aggs/ticker/{ticker}/range/{mult}/{span}/{from}/{to}` — OHLC bars
- **Timeframe mapping** (price-chart endpoint):

| UI Label | Bar Size | Lookback |
|----------|----------|----------|
| 1D | 5 min | 1 day |
| 1W | 30 min | 7 days |
| 1M | 1 day | 30 days |
| 6M | 1 day | 180 days |
| 12M | 1 day | 365 days |
| 5Y | 1 week | 1825 days |
| Max | 1 month | 7300 days |

### Massive API — Fundamentals + Short Data
- **Base URL:** `https://api.massive.com`
- **Auth:** Query param `apikey` (from `MASSIVE_API_KEY` env var)
- **Endpoints used:**
  - `/stocks/financials/v1/balance-sheets`
  - `/stocks/financials/v1/cash-flow-statements`
  - `/stocks/financials/v1/income-statements`
  - `/stocks/financials/v1/ratios`
  - `/stocks/v1/short-interest`
  - `/stocks/v1/short-volume`
  - `/stocks/vX/float`

---

## Data Flow

### Request lifecycle (example: price chart)

```
1. User clicks "6M" timeframe button
2. ResearchTab updates chartTimeframe state → "6M"
3. usePriceChart(ticker, "6M") hook fires useEffect
4. api.getPriceChart(ticker, "6M") calls GET /api/price-chart?ticker=AAPL&timeframe=6M
5. price_chart router validates timeframe, calls polygon.fetch_candles("AAPL", "6M")
6. fetch_candles() looks up CHART_TIMEFRAMES["6M"] → {multiplier: 1, span: "day", days: 180}
7. Sends GET to Polygon.io: /v2/aggs/ticker/AAPL/range/1/day/{180-days-ago}/{today}
8. Polygon returns JSON with OHLC results
9. fetch_candles() converts to list[DailyBar]
10. Router wraps in PriceChartResult (ticker, timeframe, bars, latest_close)
11. FastAPI serializes to JSON response
12. Hook receives data, sets state
13. PriceChart component re-renders SVG line chart
```

### Frontend hook pattern

All data-fetching hooks follow the same pattern:
```
useState<{ data, loading, error }>
  → useEffect([dependencies])
    → setState({ loading: true })
    → api.fetchSomething()
      → .then(data => setState({ data, loading: false }))
      → .catch(err => setState({ error: message, loading: false }))
```

---

## Frontend Tab Architecture

```
App
 └── DashboardLayout
      ├── NavTabs (Overview | Scanner | Research | Analysis*)
      ├── Overview Tab
      │    ├── MarketIndicesGrid     (useMarketIndices)
      │    ├── RecentDataTable       (useRecentData)
      │    └── UpcomingEventsPanel   (useUpcomingEvents)
      ├── Scanner Tab
      │    └── InsideDayScanner      (useInsideDays)
      └── Research Tab
           ├── CompanyHeader         (useInsideDays — for price display)
           ├── Section: Overview
           │    └── OverviewSection
           │         ├── PriceChart  (usePriceChart — separate from inside-days)
           │         └── Company details card (useCompany)
           ├── Section: Financials
           │    └── FundamentalsTable (useFundamentals — income/balance/cashflow)
           ├── Section: Short Interest
           │    └── FundamentalsTable (useFundamentals — short-interest/short-volume)
           └── Section: Float
                └── FundamentalsTable (useFundamentals — float)

* Analysis tab is disabled / coming soon
```

---

## Environment Configuration

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `MASSIVE_API_KEY` | Yes | Backend | API key for both Polygon.io and Massive |
| `VITE_API_BASE_URL` | Yes | Frontend | Backend URL (e.g. `http://localhost:8000`) |
| `DEBUG` | No | Backend | FastAPI debug mode |

### Ports
- **5173** — Vite dev server (frontend)
- **8000** — Uvicorn (backend)

### CORS
Backend allows origins: `http://localhost:5173`, `http://127.0.0.1:5173`

---

## Key Design Decisions

See [DECISIONS.md](./DECISIONS.md) for the "why" behind each choice.

**Highlights:**
- **No database** — All data is fetched on demand from external APIs. Keeps the system stateless.
- **Separate inside-days and price-chart endpoints** — Inside-day detection uses fixed 90-day daily bars; price chart supports 7 variable timeframes. Kept separate to avoid coupling.
- **Mock data for overview** — Market indices, economic data, and events use static mock data (no external API calls on the overview tab).
- **Single API key** — Both Polygon.io and Massive use the same key (`MASSIVE_API_KEY`).

---

## Boundaries

**If you are about to add a database — STOP.** This app is stateless by design. All data comes from external APIs or mock data.

**If you are about to add authentication — STOP.** This is a single-user local dashboard. No auth system exists or is planned.

**If you are about to call external APIs from the frontend — STOP.** All external API calls go through the backend to keep the API key server-side.
