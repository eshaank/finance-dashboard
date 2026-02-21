# Architectural Decisions

> Document the "why" behind key choices. Read this before proposing alternatives.

## Template

```
## ADR-001: [Short title]

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated

### Context
What is the situation that prompted this decision?

### Decision
What did we decide to do?

### Consequences
What are the trade-offs? What becomes easier or harder?
```

---

## ADR-001: Clean Project Scaffolding

**Date:** 2026-02-18
**Status:** Accepted

### Context
Project initialized using clean mode from the Claude Code Mastery Starter Kit — no framework or language opinions imposed.

### Decision
Start with a blank slate — only Claude Code infrastructure included. Language, framework, and architecture choices are made by the team as the project evolves.

### Consequences
Maximum flexibility. No assumptions made about tech stack. Team decides all coding conventions as the project grows.

---

## ADR-002: Supabase Auth (Invite-Only)

**Date:** 2026-02-21
**Status:** Accepted

### Context
The dashboard exposes market data and financial analysis tools. We need to restrict access to invited users only, with support for multiple auth methods (email/password, magic link, Google, GitHub). The app has a React + Vite frontend and FastAPI backend with no existing auth or database.

### Decision
Use **Supabase Auth** for authentication with public signups disabled (invite-only mode):

- **Frontend**: `@supabase/supabase-js` client with `AuthProvider` context. All dashboard content gated behind login. JWT attached to every API request.
- **Backend**: `PyJWT` verifies Supabase JWTs (HS256) on all data endpoints via FastAPI `Depends(get_current_user)`. Only `/api/health` remains public.
- **Database**: A single `profiles` table in Supabase Postgres with RLS and an auto-create trigger on signup. No other tables — market data remains stateless.
- **Invite flow**: Admins invite users via Supabase Dashboard or Admin API. Users receive an email link to set up their account.

### Consequences
- All dashboard access requires authentication — no anonymous browsing.
- Backend endpoints return 401 for unauthenticated requests, protecting API keys from unauthorized use.
- Adding new auth providers (e.g., Microsoft, Apple) is a Supabase config change, no code required.
- The `profiles` table is the only database dependency — market data fetching remains stateless.
- JWT secret must be kept in backend `.env` and never exposed to the frontend.
