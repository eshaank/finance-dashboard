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
| `SUPABASE_URL` | Yes | Backend | Supabase project URL (same as `VITE_SUPABASE_URL`) |
| `SUPABASE_JWT_SECRET` | Yes | Backend | JWT secret from Supabase Dashboard > Settings > API |
| `DEBUG` | No | Backend | FastAPI debug mode (default: `false`) |

## Running Locally

```bash
# Backend (from backend/)
source .venv/bin/activate
uvicorn app.main:app --reload

# Frontend (from frontend/)
npm run dev
```

## Services & Dependencies

| Service | Purpose | Auth |
|---------|---------|------|
| Polygon.io | Price data (OHLC bars) + company reference data | `MASSIVE_API_KEY` as query param |
| Massive API | Fundamentals, short interest, short volume, float | `MASSIVE_API_KEY` as query param |
| Supabase Auth | User authentication (invite-only) | `VITE_SUPABASE_ANON_KEY` / `SUPABASE_JWT_SECRET` |
| Supabase Postgres | User profiles table with RLS | Via Supabase Auth session |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | React 19 |
| Styling | Tailwind CSS | v4 |
| Backend | FastAPI + Python | Python 3.12+ |
| Auth | Supabase Auth | @supabase/supabase-js |
| Database | Supabase Postgres | (profiles only) |
| HTTP Client | httpx | (backend) |
| JWT | PyJWT | (backend) |
| Fonts | DM Sans, Playfair Display, Geist Mono | Google Fonts |
