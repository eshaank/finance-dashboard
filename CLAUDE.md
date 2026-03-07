# CLAUDE.md — Project Instructions

> **Argus** — A conversational financial research terminal.
> Chat-first interface where users ask questions in plain English and get data-driven answers with interactive visualizations.

---

## Critical Rules

### 0. NEVER Publish Sensitive Data

- NEVER commit passwords, API keys, tokens, or secrets to git/npm/docker
- NEVER commit `.env` files — ALWAYS verify `.env` is in `.gitignore`
- Before ANY commit: verify no secrets are included
- NEVER output secrets in suggestions, logs, or responses

### 1. NEVER Hardcode Credentials

- ALWAYS use environment variables for secrets
- NEVER put API keys, passwords, or tokens directly in code
- NEVER hardcode connection strings — use environment variables from .env

### 2. ALWAYS Ask Before Deploying

- NEVER auto-deploy, even if the fix seems simple
- NEVER assume approval — wait for explicit "yes, deploy"
- ALWAYS ask before deploying to production

### 3. ALWAYS Load Skills Before Working

Before starting ANY task, check the available skills list and load the most relevant one:

- **Frontend UI work** (chat interface, widgets, canvas): Load `argus-design-system` skill — this is **MANDATORY** before writing or modifying any frontend component
- **Backend API work** (domains, routers, services): Load `fastapi-templates` skill
- **Chat/LLM work** (tool registry, prompts, orchestration): Load `chat-orchestration` skill
- **Database work**: Load `supabase-postgres-best-practices` skill
- **API integrations** (Polygon, Massive, FRED): Load `massive-api` skill
- **React performance**: Load `vercel-react-best-practices` skill
- **Code review**: Load `code-review` skill

If multiple skills apply, load the most specific one first.

---

## Project Architecture

This is a two-tier application: **React + Vite** frontend and **FastAPI** backend. The backend proxies external market-data APIs (Polygon.io, Massive, FRED) and orchestrates LLM-powered chat via Claude API. Supabase handles auth and data persistence.

### The Core Loop

```
User message → Chat endpoint (SSE) → LLM with tool definitions
→ LLM selects tools → Backend calls domain services directly (no HTTP)
→ Data returned to LLM → LLM generates text + widget payloads
→ Streamed to frontend → Text renders in chat, widgets render on canvas
```

### Backend — Domain-Driven Design

Each business domain is a self-contained module. The chat service calls domain services **directly via Python imports** — not through HTTP endpoints.

```
backend/app/
├── api/v1/router.py              # Aggregates all domain routers
├── core/                          # Config, security, exceptions, middleware, rate limiting
├── shared/                        # Async HTTP client, shared schemas
├── domains/
│   ├── company/                   # Company profile, search (Polygon reference API)
│   ├── financials/                # Income statement, balance sheet, cash flow, ratios (Massive)
│   ├── pricing/                   # OHLC charts, quotes, snapshots (Polygon candles)
│   ├── short_interest/            # Short interest, short volume, float (Massive)
│   ├── corporate_actions/         # Dividends, splits, IPOs (Polygon reference)
│   ├── news/                      # Company news + market news (Polygon)
│   ├── economics/                 # Macro indicators, upcoming events (FRED + Massive)
│   ├── fred/                      # Internal — consumed by economics only
│   ├── scanner/                   # Inside-day pattern detection
│   ├── filings/                   # SEC filings
│   ├── polymarket/                # Prediction markets
│   ├── imf/                       # International macro data
│   └── chat/                      # LLM orchestration, tool registry, SSE streaming
```

### Adding a New Domain

1. Create `backend/app/domains/<name>/` with `__init__.py`, `router.py`, `schemas.py`, `service.py`, `client.py`
2. Add router import in `backend/app/api/v1/router.py`
3. Add tool entry in `backend/app/domains/chat/tools.py`
4. Zero changes to existing domains

### Frontend — Chat + Canvas

```
frontend/src/
├── components/
│   ├── chat/                      # Chat panel: messages, input, tool indicators, suggestions
│   ├── canvas/                    # Widget canvas: grid layout, widget container
│   ├── widgets/                   # Widget types: chart, table, metrics card, comparison
│   ├── sidebar/                   # Templates, conversation history, search
│   ├── layout/                    # App shell, icon rail, split-view
│   └── ui/                        # Shared primitives: badge, skeleton, button, input
├── hooks/                         # useChat, useCanvas, useTemplates, useConversation
├── lib/                           # API client, SSE handler, SWR config, Supabase client
├── types/                         # Shared TypeScript interfaces
└── App.tsx
```

---

## Domain Naming Convention

Domain names are chosen so an LLM can unambiguously select the right tool from the name alone. Each domain maps to a clear analytical concept:

| Domain | What It Answers | Tool Name Pattern |
|--------|----------------|-------------------|
| `company` | "What does this company do?" | `get_company_profile` |
| `financials` | "How profitable is this company?" | `get_income_statement`, `get_balance_sheet`, `get_cash_flow`, `get_ratios` |
| `pricing` | "What's the stock price / chart?" | `get_price_chart`, `get_quote` |
| `short_interest` | "Is this stock heavily shorted?" | `get_short_interest`, `get_short_volume`, `get_float` |
| `corporate_actions` | "Does it pay dividends? Any splits?" | `get_dividends`, `get_splits`, `get_ipos` |
| `news` | "What's in the news?" | `get_company_news`, `get_market_news` |
| `economics` | "How's the economy?" | `get_economic_indicators`, `get_upcoming_events` |
| `scanner` | "Find stocks matching a pattern" | `scan_inside_days` |
| `filings` | "Show me SEC filings" | `get_sec_filings` |

**NEVER create a domain named something vague like "research" or "data".** Domain names must be specific enough that a tool description writes itself.

---

## Chat System Rules

### Tool Registry (`domains/chat/tools.py`)

- Every tool has a `name`, `description`, `parameters`, and `handler`
- The `description` is what the LLM reads — it must be precise and unambiguous
- The `handler` points to an existing client/service function via Python import
- Tool descriptions should specify WHEN to use the tool, not just what it does
- Example: "Retrieve income statement data including revenue, operating income, net income. **Use for profitability and earnings questions.**"

### Widget Payloads

- The LLM emits structured widget payloads alongside text in its response
- Each widget payload specifies: `widget_type`, `title`, `data`, `config`, `interactions`
- The frontend widget renderer maps `widget_type` → React component
- Supported types: `line_chart`, `bar_chart`, `data_table`, `metrics_card`, `comparison_table`
- Widget data must always come from tool results — NEVER fabricated by the LLM

### Streaming (SSE)

- Chat endpoint is `POST /api/v1/chat/message` returning `text/event-stream`
- Event types: `text` (chat prose), `tool_call` (tool invocation), `tool_result` (data back), `widget` (canvas payload), `done` (stream end)
- Frontend processes all event types from the same stream

### Conversation Context

- Full conversation history is sent with each LLM call (up to context limit)
- A state object tracks: active entities (tickers), active timeframe, user expertise level
- Follow-up references like "compare that to MSFT" must resolve correctly

---

## Design System — Argus

The frontend follows the Argus design system documented in `project-docs/argus-style-guide.md`. Key principles:

- **Dark-mode only** — layered surface system (`#0a0b0e` → `#111318` → `#181b22`)
- **Three fonts** — DM Sans (UI), JetBrains Mono (data/numbers), Fraunces (display titles)
- **Accent blue** (`#5b8cff`) — the only brand color, used for active states and CTAs
- **Semantic colors** — green for positive, red for negative, amber for caution
- **No shadows** — depth comes from surface color tiers, not elevation
- **1px borders only** — `--border-subtle` for structural, `--border` for interactive
- **Rounded corners everywhere** — 8px for inputs/buttons, 12px for cards, 20px for pills
- **Stroke-only icons** — never filled, stroke-width 1.8

**MANDATORY: Load the `argus-design-system` skill before any frontend work.** The style guide has the full token list, component patterns, and do's/don'ts.

---

## Project Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `project-docs/ARCHITECTURE.md` | System overview, data flow, DDD structure | Before architectural changes |
| `project-docs/AI-CHAT-TERMINAL.md` | Chat feature plan, widget types, template system | Before chat/canvas/template work |
| `project-docs/DECISIONS.md` | ADRs — the "why" behind each choice | Before proposing alternatives |
| `project-docs/INFRASTRUCTURE.md` | Env vars, deployment, tech stack | Before environment changes |
| `project-docs/argus-style-guide.md` | Complete visual design system | Before any frontend work |
| `project-docs/product-plan.md` | Full product roadmap, phases, future plans | For strategic context |
| `project-docs/backend-refactor-plan.md` | Domain reorg details, migration plan | Before backend restructuring |

**ALWAYS read relevant docs before making cross-service changes.**

---

## When Something Seems Wrong

Before jumping to conclusions:

- Widget not rendering? → Check the widget_type matches a registered renderer BEFORE assuming broken
- LLM picking wrong tool? → Check tool descriptions in `chat/tools.py` BEFORE blaming the model
- SSE stream breaking? → Check event type parsing BEFORE assuming backend issue
- Empty data? → Check if external API services are running BEFORE assuming broken
- Auth failing? → Check which auth system (Supabase JWT) BEFORE debugging
- Test failing? → Read the error message fully BEFORE changing code

---

## Git Workflow — Branch FIRST, Work Second

**Auto-branch hook is ON by default.** A hook blocks commits to `main`.

```bash
# MANDATORY first step — do this BEFORE writing or editing anything:
git branch --show-current
# If on main → create a feature branch IMMEDIATELY:
git checkout -b feat/<task-name>
# NOW start working.
```

### Branch Naming

- `feat/chat-*` — Chat interface work
- `feat/canvas-*` — Widget canvas work
- `feat/widget-*` — New widget types
- `feat/domain-*` — Backend domain changes
- `feat/tool-*` — Chat tool registry changes
- `feat/template-*` — Template system
- `fix/*` — Bug fixes
- `refactor/*` — Reorganization without behavior change

---

## Environment Variables

| Variable | Required | Service | Description |
|----------|----------|---------|-------------|
| `MASSIVE_API_KEY` | Yes | Backend | API key for Polygon.io + Massive APIs |
| `FRED_API_KEY` | Yes | Backend | API key for FRED economic data |
| `ANTHROPIC_API_KEY` | Yes | Backend | API key for Claude LLM (chat) |
| `VITE_API_BASE_URL` | Yes | Frontend | Backend URL (e.g. `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | Yes | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend | Supabase anon key |
| `SUPABASE_URL` | Yes | Backend | Supabase URL for JWKS verification |
| `DEBUG` | No | Backend | FastAPI debug mode |

---

## Workflow Preferences

- Quality over speed — if unsure, ask before executing
- One task, one chat — `/clear` between unrelated tasks
- When testing: queue observations, fix in batch (not one at a time)
- When building widgets: always test with real API data, not mocks
- When writing tool descriptions: test with ambiguous user queries to verify the LLM picks correctly

---

## Naming — NEVER Rename Mid-Project

If you must rename packages, modules, or key variables:

1. Create a checklist of ALL files and references first
2. Use IDE semantic rename (not search-and-replace)
3. Full project search for old name after renaming
4. Check: .md files, .txt files, .env files, comments, strings, paths
5. Update tool registry if any domain was renamed
6. Start a FRESH Claude session after renaming