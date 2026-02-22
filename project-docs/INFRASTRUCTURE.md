# Infrastructure

> Document your deployment and environment setup here.

## Environments

| Environment | Frontend URL | Backend URL | Notes |
|-------------|-------------|-------------|-------|
| Development | http://localhost:5173 | http://localhost:8000 | Local only |
| Staging | TBD | TBD | |
| Production | TBD | TBD | |

## Environment Variables

| Variable | Required | Service | Description |
|----------|----------|---------|-------------|
| `MASSIVE_API_KEY` | Yes | Backend | API key for Polygon.io + Massive APIs |
| `VITE_API_BASE_URL` | Yes | Frontend | Backend URL (e.g. `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | Yes | Frontend | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend | Supabase anon/publishable key |
| `SUPABASE_URL` | Yes | Backend | Supabase project URL (JWKS / ES256 verification) |
| `DEBUG` | No | Backend | FastAPI debug mode (default: `false`) |

## Running Locally

```bash
just setup   # install backend + frontend dependencies
just dev     # run both dev servers concurrently
```

Or run individually:

```bash
just dev-backend    # backend only (port 8000)
just dev-frontend   # frontend only (port 5173)
```

## Services & Dependencies

| Service | Purpose | Auth |
|---------|---------|------|
| Polygon.io | Price data (OHLC bars) + company reference data | `MASSIVE_API_KEY` as query param |
| Massive API | Fundamentals, short interest, short volume, float | `MASSIVE_API_KEY` as query param |
| Supabase Auth | User authentication (invite-only) | `VITE_SUPABASE_ANON_KEY`; backend uses JWKS (ES256) |
| Supabase Postgres | User profiles table with RLS | Via Supabase Auth session |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | React 19, Vite 7 |
| Data Fetching | SWR | v2 |
| Styling | Tailwind CSS | v3 |
| Backend | FastAPI + Python | Python 3.13 |
| HTTP Client | httpx (async) + tenacity (retry) | |
| Caching | cachetools (TTLCache) | |
| Rate Limiting | slowapi | |
| Auth | Supabase Auth (ES256 JWKS) | @supabase/supabase-js |
| Database | Supabase Postgres | (profiles only) |
| JWT | PyJWT | |
| Fonts | DM Sans, Playfair Display, Geist Mono | Google Fonts |

## Backend Dependencies (new in refactor)

| Package | Purpose |
|---------|---------|
| `tenacity` | Retry logic for external API calls (3 attempts, exponential backoff) |
| `cachetools` | In-memory TTL caching for API responses |
| `slowapi` | Rate limiting (60 req/min per IP) |

## Deploying to Vercel

1. **Environment variables** (Vercel Dashboard > Project > Settings > Environment Variables):

   | Variable | Where | Notes |
   |----------|--------|--------|
   | `MASSIVE_API_KEY` | Backend (serverless) | Same as local |
   | `SUPABASE_URL` | Backend | e.g. `https://xxx.supabase.co` |
   | `VITE_API_BASE_URL` | Frontend (build) | Leave **empty** so API calls use same origin (`/api/...`) |
   | `VITE_SUPABASE_URL` | Frontend (build) | Same as `SUPABASE_URL` |
   | `VITE_SUPABASE_ANON_KEY` | Frontend (build) | Supabase anon/publishable key |

2. **Vercel config** (`vercel.json`):
   - Rewrites: `/api/v1/*` and `/api/*` → serverless function
   - Function timeout: 15s (accounts for retry logic latency)
   - Install: `npm install --legacy-peer-deps` (for SWR + react-simple-maps compatibility)

3. **Supabase redirect URLs**: Add production URL for OAuth/magic-link redirects.

## CI/CD

GitHub Actions CI runs on push to `main` and pull requests:

- **Backend job**: ruff lint + pytest
- **Frontend job**: eslint + tsc + vite build + vitest

See `.github/workflows/ci.yml`.

## API Documentation

Interactive API docs available at:
- `/api/v1/docs` — Swagger UI
- `/api/v1/redoc` — ReDoc

All endpoints are tagged by domain (market, research, fundamentals, scanner, economics).
