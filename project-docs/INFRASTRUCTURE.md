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
| Supabase Auth | User authentication (invite-only) | `VITE_SUPABASE_ANON_KEY`; backend uses JWKS (ES256) |
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

## Deploying to Vercel

1. **Environment variables** (Vercel Dashboard → Project → Settings → Environment Variables). Set for **Production** (and Preview if you use branch deploys):

   | Variable | Where | Notes |
   |----------|--------|--------|
   | `MASSIVE_API_KEY` | Backend (serverless) | Same as local |
   | `SUPABASE_URL` | Backend | e.g. `https://xxx.supabase.co` |
   | `VITE_API_BASE_URL` | Frontend (build) | Leave **empty** so API calls use same origin (`/api/...`) |
   | `VITE_SUPABASE_URL` | Frontend (build) | Same as `SUPABASE_URL` |
   | `VITE_SUPABASE_ANON_KEY` | Frontend (build) | Supabase anon/publishable key |

   Vite bakes `VITE_*` into the build, so they must be set in Vercel for the build step.

2. **Supabase redirect URLs**  
   Supabase Dashboard → Authentication → URL Configuration → **Redirect URLs**  
   Add your production URL, e.g. `https://your-project.vercel.app` (and `https://your-project-*.vercel.app` if you use preview deployments). Required for Google OAuth and magic-link redirects.

3. **Redeploy**  
   Push to your connected branch or trigger a redeploy. No extra build step — the existing `vercel.json` (frontend build + `/api/*` → serverless) is enough. Auth works because the serverless function loads the same FastAPI app and uses `SUPABASE_URL` for JWKS verification.
