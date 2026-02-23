# Architecture

> **This document is AUTHORITATIVE. No exceptions.**
> Read this before making cross-service changes.

---

## Overview

Finance Dashboard is a two-tier web application: a **React + Vite** frontend and a **FastAPI** backend. The backend proxies two external market-data APIs (Polygon.io and Massive) and serves the results over a REST JSON API. **Supabase Auth** handles user authentication — the frontend gates all content behind login, and the backend verifies JWTs on every API request. User profiles are stored in a Supabase Postgres `profiles` table with Row Level Security.

```mermaid
graph TB
    subgraph Client
        Browser["React SPA<br/>(Vite + SWR)"]
    end

    subgraph Backend["FastAPI Backend :8000"]
        MW["Middleware<br/>Rate Limit | Logging | Request ID"]
        Auth["JWT Verification<br/>(ES256 via JWKS)"]
        Domains["Domain Routers<br/>market | research | fundamentals<br/>scanner | economics"]
        HTTP["Async httpx Client<br/>tenacity retry (3x) | TTL cache"]
    end

    subgraph External["External Services"]
        Polygon["Polygon.io<br/>Price data + Company info"]
        Massive["Massive API<br/>Fundamentals + Shorts + Fed"]
        FRED["FRED API<br/>Economic series + releases"]
        Supabase["Supabase Cloud<br/>Auth + Postgres (profiles)"]
    end

    Browser -->|"Bearer JWT"| MW
    MW --> Auth
    Auth --> Domains
    Domains --> HTTP
    HTTP --> Polygon
    HTTP --> Massive
    HTTP --> FRED
    Browser -->|"Login / OAuth"| Supabase
    Auth -.->|"JWKS verify"| Supabase
```

---

## Backend Structure — Domain-Driven Design

The backend uses **Domain-Driven Design (DDD)** where each business domain is a self-contained module:

```mermaid
graph LR
    subgraph api["api/v1/router.py"]
        AGG["Route Aggregator"]
    end

    subgraph core["core/"]
        CFG["config"]
        SEC["security"]
        EXC["exceptions"]
        MID["middleware"]
        RL["rate_limit"]
    end

    subgraph shared["shared/"]
        HC["http_client<br/>(async + retry)"]
        SCH["schemas<br/>(ApiResponse, Paginated)"]
    end

    subgraph domains["domains/"]
        MKT["market<br/>indices, price charts"]
        RES["research<br/>company details"]
        FUN["fundamentals<br/>financials, ratios, shorts"]
        SCN["scanner<br/>inside days"]
        ECO["economics<br/>indicators, events"]
        FRD["fred<br/>(internal: series + releases)"]
        FIL["filings (placeholder)"]
        NEW["news (placeholder)"]
        SCR["screener (placeholder)"]
    end

    AGG --> MKT
    AGG --> RES
    AGG --> FUN
    AGG --> SCN
    AGG --> ECO

    MKT --> HC
    RES --> HC
    FUN --> HC
    SCN --> MKT
    ECO --> FRD
    ECO --> HC
    FRD --> HC

    style FIL fill:#333,stroke:#555,color:#888
    style NEW fill:#333,stroke:#555,color:#888
    style SCR fill:#333,stroke:#555,color:#888
```

### Directory Layout

```
backend/app/
├── api/v1/router.py         # Aggregates all domain routers under /api/v1
├── core/
│   ├── config.py            # Settings + get_settings() with @lru_cache
│   ├── security.py          # JWT verification (ES256 via JWKS)
│   ├── exceptions.py        # AppException hierarchy + global handler
│   ├── middleware.py         # Request logging + X-Request-ID
│   └── rate_limit.py        # slowapi (60 req/min)
├── shared/
│   ├── http_client.py       # Async httpx + tenacity retry
│   └── schemas.py           # ApiResponse[T], PaginatedResponse[T]
├── domains/
│   ├── market/              # router, schemas, service, client
│   ├── research/            # router, schemas, service, client
│   ├── fundamentals/        # router, schemas, service, client
│   ├── scanner/             # router, schemas, service
│   ├── economics/           # router, schemas, service, client
│   ├── fred/                # client, service (internal — consumed by economics)
│   ├── filings/             # placeholder
│   ├── news/                # placeholder
│   └── screener/            # placeholder
├── data/mock_data.py
└── main.py
```

### Adding a New Domain

1. Create `backend/app/domains/<name>/` with `__init__.py`, `router.py`, `schemas.py`, `service.py`, `client.py`
2. Add router import in `backend/app/api/v1/router.py`
3. Add corresponding frontend hook + component
4. Zero changes to existing domains

---

## Data Flow

### Request Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant SWR as SWR Cache
    participant FE as apiFetcher
    participant MW as Middleware
    participant R as Router
    participant S as Service
    participant C as Client
    participant Cache as TTL Cache
    participant API as Polygon.io

    U->>SWR: Click "6M" timeframe
    SWR->>SWR: Check cache (key: /price-chart?ticker=AAPL&timeframe=6M)

    alt Cache miss
        SWR->>FE: Fetch
        FE->>MW: GET /api/v1/price-chart + Bearer JWT
        MW->>MW: Rate limit check, assign X-Request-ID
        MW->>R: market/router
        R->>S: validate_timeframe("6M")
        R->>C: fetch_candles(client, "AAPL", "6M")
        C->>Cache: Check TTL cache

        alt Cache miss
            C->>API: GET /v2/aggs/ticker/AAPL/range/1/day/...
            Note over C,API: tenacity: 3 attempts, exponential backoff
            API-->>C: OHLC bars JSON
            C->>Cache: Store (TTL: 60s)
        end

        Cache-->>C: Cached bars
        C-->>R: list[DailyBar]
        R-->>FE: PriceChartResult JSON
        FE-->>SWR: Store in SWR cache
    end

    SWR-->>U: Render chart
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant SB as Supabase Auth
    participant BE as Backend
    participant JWKS as Supabase JWKS

    U->>FE: Login (email/password or OAuth)
    FE->>SB: signInWithPassword() / signInWithOAuth()
    SB-->>FE: Session { access_token (JWT) }
    FE->>FE: Store in AuthContext

    U->>FE: Navigate to Research tab
    FE->>BE: GET /api/v1/company/details?ticker=AAPL<br/>Authorization: Bearer <JWT>
    BE->>JWKS: Fetch signing key (cached via @lru_cache)
    JWKS-->>BE: ES256 public key
    BE->>BE: jwt.decode(token, key, algorithms=["ES256"])

    alt Valid token
        BE-->>FE: 200 CompanyDetailsResponse
    else Expired/Invalid
        BE-->>FE: 401 Unauthorized
        FE->>SB: refreshSession()
    end
```

---

## Frontend Architecture

### Component Tree

```mermaid
graph TD
    App["App<br/>(SWRConfig)"]
    Auth["AuthProvider"]
    AC["AppContent"]
    AP["AuthPage"]
    H["Header + NavTabs"]
    DH["DashboardHome"]
    DL["DashboardLayout"]

    App --> Auth --> AC
    AC -->|"no session"| AP
    AC -->|"authenticated"| H
    AC -->|"home"| DH
    AC -->|"tab selected"| DL

    subgraph Home["Home Tab"]
        MIG["MarketIndicesGrid<br/>(useMarketIndices)"]
        RDT["RecentDataTable<br/>(useRecentData)"]
        UEP["UpcomingEventsPanel<br/>(useUpcomingEvents)"]
    end

    subgraph Scanner["Scanner Tab"]
        IDS["InsideDayScanner<br/>(useInsideDays)"]
    end

    subgraph Research["Research Tab"]
        CH["CompanyHeader<br/>(useInsideDays)"]
        OV["OverviewSection<br/>(usePriceChart, useCompany)"]
        FS["FinancialsSection<br/>(useFundamentals)"]
        SI["ShortInterestSection<br/>(useFundamentals)"]
        FL["FloatSection<br/>(useFundamentals)"]
    end

    subgraph Global["Global Economics Tab"]
        WC["WorldChoropleth<br/>(useWorldBankData)"]
    end

    DH --> Home
    DL --> Scanner
    DL --> Research
    DL --> Global
```

### SWR Hook Pattern

All data-fetching hooks follow the same pattern:

```typescript
useSWR<T>(key | null, apiFetcher) → { data, error, isLoading }
```

SWR provides: request deduplication, in-memory caching, stale-while-revalidate, automatic error retry, and focus revalidation (disabled by default).

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
| GET | `/economic-data` | economics | FRED + Massive (Fed) | Economic indicators |
| GET | `/upcoming-events` | economics | FRED (releases) | Upcoming events |
| GET | `/health` | main | - | Health check |

---

## External API Integrations

### Polygon.io — Price Data + Company Info
- **Base URL:** `https://api.polygon.io`
- **Auth:** Query param `apiKey` (from `MASSIVE_API_KEY` env var)
- **Retry:** 3 attempts, exponential backoff (tenacity)
- **Cache:** TTLCache (1min candles, 5min company details)

### FRED — Federal Reserve Economic Data
- **Base URL:** `https://api.stlouisfed.org/fred`
- **Auth:** Query param `api_key` (from `FRED_API_KEY` env var)
- **Retry:** 3 attempts, exponential backoff (tenacity)
- **Cache:** TTLCache (10min for series observations and release dates)
- **Used by:** `fred/client.py` → `fred/service.py` → `economics/service.py`

### Massive API — Fundamentals + Short Data + Fed
- **Base URL:** `https://api.massive.com`
- **Auth:** Query param `apiKey` (from `MASSIVE_API_KEY` env var)
- **Retry:** 3 attempts, exponential backoff (tenacity)

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
