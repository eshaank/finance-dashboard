# Architectural Decisions

> Document the "why" behind key choices. Read this before proposing alternatives.

## Template

```
## ADR-NNN: [Short title]

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
The dashboard exposes market data and financial analysis tools. We need to restrict access to invited users only, with support for multiple auth methods (email/password, magic link, Google, GitHub).

### Decision
Use **Supabase Auth** for authentication with public signups disabled (invite-only mode). Backend verifies JWTs via JWKS endpoint (ES256). Only `/api/health` is public.

### Consequences
- All dashboard access requires authentication.
- Adding new auth providers is a Supabase config change, no code required.
- JWT secret rotation handled by Supabase automatically.

---

## ADR-003: Domain-Driven Design (DDD) Backend Structure

**Date:** 2026-02-21
**Status:** Accepted

### Context
The original flat structure (`routers/`, `services/`) worked for 7 endpoints but would not scale well as we add SEC filings, news, screeners, and watchlists. Each new feature required touching multiple directories and the shared services file grew unwieldy.

### Decision
Adopt DDD where each business domain (`pricing`, `company`, `financials`, `short_interest`, `corporate_actions`, `scanner`, `economics`, `news`) is a self-contained module with its own `router.py`, `schemas.py`, `service.py`, and `client.py`. Shared infrastructure lives in `core/` and `shared/`.

### Consequences
- Adding a new domain is trivial: create folder, register router, done.
- Domain isolation reduces coupling — changing the Polygon client doesn't affect Massive endpoints.
- Slightly more files per feature, but each file is small and focused.
- Business logic (e.g., inside-day algorithm) lives in service layer, not routers.

---

## ADR-004: SWR for Frontend Data Fetching

**Date:** 2026-02-21
**Status:** Accepted

### Context
All 8 frontend hooks followed the same useState/useEffect pattern with manual loading/error state. No request deduplication — navigating between tabs caused duplicate API calls. No caching — data was refetched on every render.

### Decision
Replace all custom hooks with **SWR** (`useSWR`). Global SWR config provides revalidation, deduplication, and error retry. Each hook is now ~10 lines.

### Consequences
- Automatic request deduplication (same key = same request).
- Built-in caching with configurable revalidation.
- Eliminated ~200 lines of boilerplate across 8 hooks.
- SWR adds ~4KB gzipped to bundle.

---

## ADR-005: API Versioning (v1)

**Date:** 2026-02-21
**Status:** Accepted

### Context
The app had no API versioning. All endpoints were at `/api/*`. Future changes (response envelope, pagination, new fields) would break existing clients.

### Decision
Version the API under `/api/v1/`. Mount the same routers at `/api/` for backward compatibility during transition. Frontend updated to use `/api/v1/` paths.

### Consequences
- Breaking changes can be introduced in `/api/v2/` without affecting v1 clients.
- Dual mount adds minimal overhead (FastAPI shares the same router objects).
- Legacy `/api/` mount can be removed once all clients migrate.

---

## ADR-006: Async HTTP + Retry + Caching

**Date:** 2026-02-21
**Status:** Accepted

### Context
All external API calls were synchronous (`httpx.get()`), blocking the event loop. No retry logic — transient failures from Polygon.io or Massive caused immediate 500s. No caching — identical requests within seconds hit external APIs repeatedly.

### Decision
- Convert all external calls to **async** (`httpx.AsyncClient`).
- Add **tenacity** retry (3 attempts, exponential backoff) for transport errors.
- Add **cachetools TTLCache** for frequently-accessed data (1min candles, 5min company details).
- Manage httpx client lifecycle via FastAPI lifespan.

### Consequences
- External API flakiness is handled gracefully (retry before failing).
- Candle data cached for 1 minute reduces Polygon API usage significantly.
- Company details cached for 5 minutes (rarely changes).
- Shared async client reuses connections efficiently.

---

## ADR-007: Global Error Handling

**Date:** 2026-02-21
**Status:** Accepted

### Context
Every router handler had its own try/except block converting exceptions to HTTPException. The pattern was duplicated 15+ times with inconsistent error messages and status codes.

### Decision
Create an `AppException` hierarchy (`ExternalAPIError`, `NotFoundError`, `ValidationError`) with a global FastAPI exception handler. Domain routers raise semantic exceptions; the handler converts to JSON responses.

### Consequences
- Consistent error response format across all endpoints.
- Router code focuses on business logic, not error formatting.
- New domains get error handling for free.

---

## ADR-008: Rate Limiting (slowapi)

**Date:** 2026-02-21
**Status:** Accepted

### Context
No rate limiting existed. A misbehaving client could exhaust external API quotas (Polygon, Massive) or overload the backend.

### Decision
Add **slowapi** with a default limit of 60 requests/minute per IP address.

### Consequences
- External API quotas are protected.
- Legitimate users unlikely to hit 60/min limit.
- Rate limit info returned in response headers (`X-RateLimit-*`).

---

## ADR-009: Response Envelope Format

**Date:** 2026-02-21
**Status:** Accepted

### Context
API responses returned raw data arrays/objects. No metadata (timestamps, request IDs) was included. This made debugging and monitoring harder.

### Decision
Define `ApiResponse[T]` envelope: `{ data: T, meta: { timestamp, request_id } }` and `PaginatedResponse[T]` with additional pagination fields. Frontend `apiFetcher` automatically unwraps the envelope.

### Consequences
- Every response includes a request ID for debugging.
- Pagination metadata available for large datasets.
- Frontend unwrapping is transparent — hooks see raw data types.

---

## ADR-010: Widget Dashboard Architecture

**Date:** 2026-02-23
**Status:** Accepted

### Context
DashboardHome was a placeholder. Users need a customizable landing page with draggable, resizable widgets.

### Decision
Registry-based plugin system with react-grid-layout:
- Widget registry is the single source of truth for available types
- Storage abstraction isolates persistence (localStorage now, Supabase later)
- Each widget type is self-contained in `widgets/definitions/`
- Adding a widget = one file + one import in the barrel

### Consequences
- Maximum extensibility with zero core changes for new widget types
- Supabase migration requires changing only `storage.ts`
- react-grid-layout adds ~25KB gzipped
- Widget configs are fully JSON-serializable for persistence

---

## ADR-011: Domain Reorganization for LLM Tool Semantics

**Date:** 2026-03-06
**Status:** Accepted

### Context
Original domains were organized around dashboard tabs (`market/`, `research/`, `fundamentals/`). For the upcoming LLM chat system, domain names must be semantically unambiguous so an LLM can select the right tool from the name alone. `fundamentals/` conflated financial statements with short interest data. `research/` mixed company profiles with corporate actions. `market/` bundled pricing, news, and indices.

### Decision
Split and rename domains for single-concept clarity:
- `market/` → `pricing/` (charts, quotes, indices)
- `research/` → `company/` (profile, search) + `corporate_actions/` (dividends, splits, IPOs)
- `fundamentals/` → `financials/` (income statement, balance sheet, cash flow, ratios) + `short_interest/` (short interest, short volume, float)
- Market news merged into expanded `news/` domain (company + market news)

### Consequences
- Each domain maps to exactly one analytical concept — LLM tool selection is unambiguous.
- More domains (8 active vs 5) but each is smaller and more focused.
- Scanner cross-domain imports updated from `market` to `pricing`.
- No business logic changes — only module boundaries moved.
- All API paths updated to reflect new domain ownership.
