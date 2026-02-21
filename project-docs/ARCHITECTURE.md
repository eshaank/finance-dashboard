# Architecture

> **This document is AUTHORITATIVE. No exceptions.**
> Read this before making cross-service changes.

---

## Overview

Finance Dashboard is a two-tier web application: a **React + Vite** frontend and a **FastAPI** backend. The backend proxies two external market-data APIs (Polygon.io and Massive) and serves the results over a REST JSON API. **Supabase Auth** handles user authentication — the frontend gates all content behind login, and the backend verifies JWTs on every API request. User profiles are stored in a Supabase Postgres `profiles` table with Row Level Security.

```
Browser (React SPA)
   |
   |  Auth: Supabase Auth (email/password, magic link, Google, GitHub)
   |  API:  HTTP GET + Authorization: Bearer <JWT>
   |  Data: SWR (caching, deduplication, revalidation)
   v
FastAPI Backend (:8000)
   |
   |  JWT verification (ES256 via JWKS)
   |  Rate limiting (slowapi, 60 req/min)
   |  Async httpx + tenacity retry (3 attempts, exponential backoff)
   |  In-memory TTL caching (cachetools)
   v
Polygon.io API  /  Massive API

Supabase Cloud
   ├── Auth (user sessions, invite-only signups)
   └── Postgres (profiles table with RLS)
```

---

## Backend Structure — Domain-Driven Design

The backend uses **Domain-Driven Design (DDD)** where each business domain is a self-contained module:

```
backend/app/
├── api/
│   ├── dependencies.py            # Shared deps (re-exports get_current_user)
│   └── v1/
│       └── router.py              # Aggregates all domain routers under /api/v1
├── core/
│   ├── config.py                  # Settings + get_settings() with @lru_cache
│   ├── security.py                # JWT verification (ES256 via JWKS)
│   ├── exceptions.py              # Global error handling (AppException hierarchy)
│   ├── middleware.py               # Request logging + X-Request-ID
│   └── rate_limit.py              # slowapi rate limiter (60/min)
├── shared/
│   ├── http_client.py             # Async httpx client with tenacity retry
│   └── schemas.py                 # ApiResponse[T], PaginatedResponse[T]
├── domains/
│   ├── market/                    # Market indices + price charts (Polygon.io)
│   │   ├── router.py              # GET /market-indices, GET /price-chart
│   │   ├── schemas.py             # MarketIndex, OHLCBar, PriceChartResult
│   │   ├── service.py             # Timeframe validation, bar conversion
│   │   └── client.py              # Polygon candle API + TTLCache (1min)
│   ├── research/                  # Company details (Polygon.io)
│   │   ├── router.py              # GET /company/details
│   │   ├── schemas.py             # CompanyDetailsResponse
│   │   ├── service.py             # Response formatting
│   │   └── client.py              # Polygon company API + TTLCache (5min)
│   ├── fundamentals/              # Financial data (Massive API)
│   │   ├── router.py              # 7 endpoints with pagination
│   │   ├── schemas.py             # All financial statement models
│   │   ├── service.py             # DRY generic fetch_and_parse helper
│   │   └── client.py              # Massive API async client
│   ├── scanner/                   # Technical pattern scanners
│   │   ├── router.py              # GET /inside-days
│   │   ├── schemas.py             # InsideDayResult
│   │   └── service.py             # count_inside_days algorithm + compression
│   ├── economics/                 # Economic indicators (mock data)
│   │   ├── router.py              # GET /economic-data, GET /upcoming-events
│   │   ├── schemas.py             # EconomicDataPoint, UpcomingEvent
│   │   └── service.py             # Mock data (swappable to real API)
│   ├── filings/                   # PLACEHOLDER — SEC Filings
│   ├── news/                      # PLACEHOLDER — News & Sentiment
│   └── screener/                  # PLACEHOLDER — Screener/Watchlist
├── data/
│   └── mock_data.py               # Static mock data for economics domain
└── main.py                        # App factory, middleware, router registration
```

### Adding a New Domain

1. Create `backend/app/domains/<name>/` with `__init__.py`, `router.py`, `schemas.py`, `service.py`, `client.py`
2. Add router import in `backend/app/api/v1/router.py`
3. Add corresponding frontend hook + component
4. Zero changes to existing domains

---

## Services

### Frontend — React + Vite (port 5173)

| Does | Does NOT |
|------|----------|
| Render dashboard UI (Overview, Scanner, Research, Global Economics) | Store any persistent data |
| Cache + deduplicate requests via SWR | Perform server-side rendering |
| Call backend REST API via `apiFetcher` | Call external APIs directly |
| Handle timeframe/tab/section navigation | |
| Authenticate users via Supabase Auth | |

**Key paths:**
- `src/App.tsx` — Root component (SWRConfig > AuthProvider > Router)
- `src/lib/swr.ts` — SWR global config, typed fetcher with envelope unwrapping
- `src/lib/api.ts` — Named API methods (convenience wrappers)
- `src/hooks/` — SWR-based data-fetching hooks (one per API resource)
- `src/types/index.ts` — Shared TypeScript interfaces + ApiResponse envelope
- `src/components/ui/ErrorBoundary.tsx` — React error boundary
- `src/components/ui/Skeleton.tsx` — Loading skeleton variants

### Backend — FastAPI (port 8000)

| Does | Does NOT |
|------|----------|
| Proxy Polygon.io for price/company data | Store data in a database |
| Proxy Massive API for fundamentals/short data | Handle user sessions (Supabase does this) |
| Detect inside-day patterns (algorithm in service layer) | Handle WebSocket connections |
| Cache API responses (TTLCache, 1-5min) | Push notifications |
| Retry failed external requests (tenacity, 3 attempts) | |
| Rate limit requests (slowapi, 60/min) | |
| Add X-Request-ID to all responses | |

---

## API Endpoints

All routes available at both `/api/v1` (versioned) and `/api` (backward-compat):

| Method | Path | Domain | External API | Purpose |
|--------|------|--------|--------------|---------|
| GET | `/market-indices` | market | Mock data | SPY, QQQ, IWM, etc. |
| GET | `/price-chart?ticker=&timeframe=` | market | Polygon (candles) | OHLC chart data (7 timeframes) |
| GET | `/company/details?ticker=` | research | Polygon (reference) | Company info + logo |
| GET | `/fundamentals/balance-sheet?ticker=&page=&per_page=` | fundamentals | Massive | Balance sheets |
| GET | `/fundamentals/cash-flow?ticker=&page=&per_page=` | fundamentals | Massive | Cash flow statements |
| GET | `/fundamentals/income-statement?ticker=&page=&per_page=` | fundamentals | Massive | Income statements |
| GET | `/fundamentals/ratios?ticker=&page=&per_page=` | fundamentals | Massive | Financial ratios |
| GET | `/fundamentals/short-interest?ticker=&page=&per_page=` | fundamentals | Massive | Short interest data |
| GET | `/fundamentals/short-volume?ticker=&page=&per_page=` | fundamentals | Massive | Short volume data |
| GET | `/fundamentals/float?ticker=` | fundamentals | Massive | Free float data |
| GET | `/inside-days?ticker=` | scanner | Polygon (daily bars) | Inside-day pattern detection |
| GET | `/economic-data` | economics | Mock data | Economic indicators |
| GET | `/upcoming-events` | economics | Mock data | Upcoming events |
| GET | `/health` | main | - | Health check |

---

## External API Integrations

### Polygon.io — Price Data + Company Info
- **Base URL:** `https://api.polygon.io`
- **Auth:** Query param `apiKey` (from `MASSIVE_API_KEY` env var)
- **Retry:** 3 attempts, exponential backoff (tenacity)
- **Cache:** TTLCache (1min candles, 5min company details)

### Massive API — Fundamentals + Short Data
- **Base URL:** `https://api.massive.com`
- **Auth:** Query param `apiKey` (from `MASSIVE_API_KEY` env var)
- **Retry:** 3 attempts, exponential backoff (tenacity)

---

## Data Flow

### Request lifecycle (example: price chart)

```
1. User clicks "6M" timeframe button
2. ResearchTab updates chartTimeframe state → "6M"
3. usePriceChart(ticker, "6M") → SWR key changes → triggers fetch
4. SWR checks cache → miss → calls apiFetcher("/api/v1/price-chart?...")
5. apiFetcher attaches JWT, calls backend
6. market/router validates timeframe via service layer
7. market/client checks TTLCache → miss → fetch_with_retry to Polygon.io
8. tenacity handles retries on transport errors
9. Polygon returns OHLC bars → cached in TTLCache
10. Router wraps in PriceChartResult, returns JSON
11. SWR caches response, deduplicates concurrent requests
12. PriceChart component re-renders with new data
```

### Frontend hook pattern (SWR)

```
useSWR<T>(key | null, apiFetcher) → { data, error, isLoading }
```

All hooks follow this pattern — SWR handles caching, deduplication, error retry, and revalidation.

---

## Frontend Tab Architecture

```
App (SWRConfig > AuthProvider)
 └── DashboardLayout
      ├── NavTabs (Home | Scanner | Research | Global Economics)
      ├── Home
      │    ├── MarketIndicesGrid     (useMarketIndices)
      │    ├── RecentDataTable       (useRecentData)
      │    └── UpcomingEventsPanel   (useUpcomingEvents)
      ├── Scanner
      │    └── InsideDayScanner      (useInsideDays)
      ├── Research
      │    ├── CompanyHeader         (useInsideDays)
      │    ├── OverviewSection       (usePriceChart, useCompany)
      │    ├── FinancialsSection     (useFundamentals)
      │    ├── ShortInterestSection  (useFundamentals)
      │    └── FloatSection          (useFundamentals)
      └── Global Economics
           └── WorldChoropleth      (useWorldBankData — client-side JSON)
```

---

## Authentication

Authentication uses **Supabase Auth** in invite-only mode:

- **Frontend**: `AuthProvider` wraps the app. JWT attached to all API requests via SWR fetcher.
- **Backend**: Every protected endpoint uses `Depends(get_current_user)` which verifies the JWT via JWKS endpoint (ES256).
- **Rate limiting**: 60 requests/minute per IP via slowapi.

---

## Environment Configuration

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `MASSIVE_API_KEY` | Yes | Backend | API key for both Polygon.io and Massive |
| `VITE_API_BASE_URL` | Yes | Frontend | Backend URL (e.g. `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | Yes | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend | Supabase anon/publishable key |
| `SUPABASE_URL` | Yes | Backend | Supabase project URL |
| `DEBUG` | No | Backend | FastAPI debug mode |

---

## Key Design Decisions

See [DECISIONS.md](./DECISIONS.md) for the "why" behind each choice.

---

## Boundaries

**If you are about to add a new database table — STOP and think.** Market data is stateless by design. The only DB table is `profiles`. Adding tables requires an ADR.

**If you are about to call external APIs from the frontend — STOP.** All external API calls go through the backend to keep the API key server-side.

**If you are about to bypass auth on an endpoint — STOP.** All data endpoints require a valid JWT. Only `/api/health` is public.
