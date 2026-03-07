# Backend Assessment — Refactor Plan for AI Chat Terminal

## The Short Answer

**Your backend needs almost zero refactoring.** The core infrastructure — `shared/http_client.py`, `core/security.py`, `core/config.py`, `core/exceptions.py`, rate limiting, middleware, the lifespan-managed httpx client — all of it stays exactly as-is. The only changes are reorganizing some domain folders for better LLM tool semantics, and adding the new `chat/` domain.

---

## What Stays Untouched

These files require **zero changes**:

| File/Module | Why it's fine |
|---|---|
| `main.py` | Lifespan, CORS, middleware, rate limiting — all reusable. Just add `POST` to `allow_methods` (already there) and wire the new chat router. |
| `core/config.py` | Add one new env var (`ANTHROPIC_API_KEY`) to the Settings model. That's it. |
| `core/security.py` | JWT verification stays the same. Chat endpoint uses `Depends(get_current_user)` like everything else. |
| `core/exceptions.py` | `AppException` hierarchy works for chat errors too. |
| `core/middleware.py` | Request logging + X-Request-ID — no changes. |
| `core/rate_limit.py` | May want a separate limit for the chat endpoint (LLM calls are expensive), but that's a config addition, not a refactor. |
| `shared/http_client.py` | `fetch_with_retry` + `create_async_client` — used by every domain, no changes needed. |
| `shared/schemas.py` | `ApiResponse[T]` envelope works for chat responses too. |
| `api/v1/router.py` | Just add the new domain router imports. |

---

## Domain Reorganization

Here's where it gets interesting. Your current domain structure was designed for a dashboard with discrete tabs. For an LLM-driven interface, the key question is: **when a user asks a question, can the LLM unambiguously pick the right tool?** That means domain and tool names need to be semantically clear.

### Current Problems

**1. `research/` is a grab-bag.** It contains company profile info, dividend history, and split history. These are three different analytical concepts. An LLM seeing a tool called `research.get_company_details` might think it does deep research, when it really just returns a profile card. And dividends/splits are corporate actions — they have nothing to do with "research."

**2. `market/` is overloaded.** It contains price charts (core), snapshot quotes (core), *and* market-wide news, upcoming splits, upcoming dividends, and recent IPOs. The news and event data are conceptually different from price data. An LLM tool called `market.fetch_market_news` is confusingly close to `news.fetch_company_news`.

**3. `economics/` and `fred/` are split awkwardly.** `fred/` is an internal module consumed only by `economics/`, which makes sense architecturally, but from the LLM's perspective there's one concept: economic data. This is actually fine — just keep `fred/` internal and expose tools only through `economics/`.

**4. `news/` (company) vs market news in `market/`.** Company-specific news is in `news/`, but market-wide news is in `market/client.py`. These should live together.

### Proposed Reorganization

The goal: **each domain maps to a clear analytical concept that an LLM can reason about from the name alone.**

```
domains/
├── company/                 # Everything about a single company's identity
│   ├── router.py           # GET /company/profile, /company/search
│   ├── schemas.py          # CompanyProfile, CompanySearchResult
│   ├── service.py
│   └── client.py           # Polygon reference API
│
├── financials/              # Financial statements (was: fundamentals)
│   ├── router.py           # GET /financials/income-statement, /balance-sheet, /cash-flow, /ratios
│   ├── schemas.py
│   ├── service.py
│   └── client.py           # Massive API
│
├── pricing/                 # Price data and quotes (was: market)
│   ├── router.py           # GET /pricing/chart, /pricing/quote, /pricing/snapshot
│   ├── schemas.py
│   ├── service.py
│   └── client.py           # Polygon candles + snapshots
│
├── short_interest/          # Short selling data (extracted from fundamentals)
│   ├── router.py           # GET /short-interest/interest, /short-interest/volume, /short-interest/float
│   ├── schemas.py
│   ├── service.py
│   └── client.py           # Massive API
│
├── corporate_actions/       # Dividends, splits, IPOs (extracted from research + market)
│   ├── router.py           # GET /corporate-actions/dividends, /splits, /ipos
│   ├── schemas.py
│   ├── service.py
│   └── client.py           # Polygon reference API
│
├── news/                    # All news — company and market (merged)
│   ├── router.py           # GET /news/company, /news/market
│   ├── schemas.py
│   ├── service.py
│   └── client.py           # Polygon news API
│
├── economics/               # Macro data — stays as-is
│   ├── router.py           # GET /economics/indicators, /economics/events
│   ├── schemas.py
│   ├── service.py
│   └── client.py
│
├── fred/                    # Internal — consumed by economics only (no changes)
│   ├── client.py
│   └── service.py
│
├── scanner/                 # Pattern detection — stays as-is
│   ├── router.py           # GET /scanner/inside-days, /scanner/scan
│   ├── schemas.py
│   ├── service.py
│   └── client.py
│
├── filings/                 # SEC filings — stays as-is
│   ├── router.py
│   ├── schemas.py
│   ├── service.py
│   └── client.py
│
├── polymarket/              # Prediction markets — stays as-is
│   ├── router.py
│   ├── schemas.py
│   ├── service.py
│   └── client.py
│
├── imf/                     # International macro — stays as-is
│   ├── router.py
│   ├── schemas.py
│   ├── service.py
│   └── client.py
│
└── chat/                    # NEW — LLM orchestration
    ├── router.py            # POST /chat/message (SSE streaming)
    ├── schemas.py           # ChatMessage, ToolCall, WidgetPayload
    ├── service.py           # LLM orchestration, conversation management
    ├── tools.py             # Tool registry mapping names → service functions
    └── prompts.py           # System prompts, skill definitions
```

### What Actually Moves

Here's the concrete migration. No code logic changes — just reorganizing which file lives where.

| Current Location | Moves To | What It Is |
|---|---|---|
| `research/client.fetch_company_details` | `company/client.py` | Company profile data |
| `research/client.fetch_dividend_history` | `corporate_actions/client.py` | Dividend history for a ticker |
| `research/client.fetch_split_history` | `corporate_actions/client.py` | Split history for a ticker |
| `market/client.fetch_candles` | `pricing/client.py` | OHLC price chart data |
| `market/client.fetch_snapshot_quotes` | `pricing/client.py` | Real-time quote snapshots |
| `market/client.fetch_daily_candles` | `pricing/client.py` | Daily bars (used by scanner too) |
| `market/client.fetch_market_news` | `news/client.py` | Market-wide news (merge with company news) |
| `market/client.fetch_upcoming_splits` | `corporate_actions/client.py` | Forward-looking splits |
| `market/client.fetch_upcoming_dividends` | `corporate_actions/client.py` | Forward-looking dividends |
| `market/client.fetch_recent_ipos` | `corporate_actions/client.py` | Recent IPOs |
| `market/service.bars_to_ohlc` | `pricing/service.py` | Bar conversion helper |
| `market/service.*_to_schema` (news, splits, dividends, ipos) | Respective new domains | Schema converters |
| `fundamentals/client.get_short_interest` | `short_interest/client.py` | Short interest data |
| `fundamentals/client.get_short_volume` | `short_interest/client.py` | Short volume data |
| `fundamentals/client.get_float` | `short_interest/client.py` | Float data |
| `fundamentals/` (remaining: balance sheet, cash flow, income, ratios) | `financials/` | Rename only |

### What This Does for the LLM

After reorganization, the tool names become self-documenting:

```
company.get_profile("AAPL")           → "What does Apple do? How big are they?"
financials.get_income_statement("AAPL") → "Show me Apple's revenue and earnings"
financials.get_balance_sheet("AAPL")    → "What's on Apple's balance sheet?"
pricing.get_chart("AAPL", "6M")        → "Show me Apple's stock price"
pricing.get_quote("AAPL")              → "What's Apple trading at right now?"
short_interest.get_interest("AAPL")     → "Is Apple heavily shorted?"
corporate_actions.get_dividends("AAPL") → "Does Apple pay dividends?"
corporate_actions.get_splits("AAPL")    → "Has Apple ever split?"
news.get_company_news("AAPL")          → "What's in the news about Apple?"
news.get_market_news()                 → "What's happening in the market today?"
economics.get_indicators()             → "How's the economy doing?"
economics.get_events()                 → "What economic data is coming up?"
scanner.scan_inside_days()             → "Find me stocks with inside day patterns"
filings.get_sec_filings("AAPL")        → "Show me Apple's SEC filings"
polymarket.get_events()                → "What are prediction markets saying?"
imf.get_series(...)                    → "Show me international economic data"
```

An LLM reading these tool names and descriptions can pick the right one without ambiguity. Contrast this with the current setup where `research` could mean anything, `market` does six different things, and `fundamentals` mixes financial statements with short data.

### Cross-Domain Dependencies

One thing to watch: `scanner/` currently imports from `market/client.py` (`fetch_daily_candles`, `DailyBar`). After the reorg, this import changes to `pricing/client.py`. That's a one-line import path change in `scanner/router.py` and `scanner/service.py`. No logic changes.

---

## The `chat/` Domain — How It Wires In

The chat domain is the only truly new code. Here's how it fits:

```python
# chat/tools.py (conceptual structure)

from app.domains.company import client as company_client
from app.domains.financials import client as financials_client
from app.domains.pricing import client as pricing_client
from app.domains.short_interest import client as short_client
from app.domains.corporate_actions import client as ca_client
from app.domains.news import client as news_client
from app.domains.economics import service as econ_service
from app.domains.scanner import service as scanner_service
from app.domains.filings import client as filings_client

TOOLS = [
    {
        "name": "get_company_profile",
        "description": "Get company details including name, description, sector, employee count, and market cap. Use when the user asks about what a company does or basic company info.",
        "parameters": {"ticker": {"type": "string", "description": "Stock ticker symbol"}},
        "handler": company_client.fetch_company_details,
    },
    {
        "name": "get_income_statement",
        "description": "Get income statement data including revenue, operating income, net income, and EPS over multiple periods. Use for profitability and earnings questions.",
        "parameters": {"ticker": {"type": "string"}},
        "handler": financials_client.get_income_statement,
    },
    {
        "name": "get_price_chart",
        "description": "Get historical OHLC price data for a stock. Supports timeframes: 1D, 1W, 1M, 6M, 12M, 5Y, Max. Use for price history, trend, and chart requests.",
        "parameters": {
            "ticker": {"type": "string"},
            "timeframe": {"type": "string", "enum": ["1D","1W","1M","6M","12M","5Y","Max"]},
        },
        "handler": pricing_client.fetch_candles,
    },
    # ... etc for every tool
]
```

The key: **every handler points to an existing client/service function.** No new data-fetching code. The chat domain is purely orchestration — it takes user messages, builds an LLM request with tool definitions, executes the tools the LLM chooses by calling your existing services directly, and streams back the results.

---

## Migration Plan

Since you're gutting the frontend anyway, you can do the backend reorg in one pass without breaking anything that matters.

**Step 1: Reorganize domains** (half a day)
- Create new folders: `company/`, `financials/`, `pricing/`, `short_interest/`, `corporate_actions/`
- Move client/service/schema/router files per the table above
- Update import paths in `scanner/` (the only cross-domain dependency)
- Update `api/v1/router.py` with new imports
- Run your existing tests — they should pass with only import path changes

**Step 2: Add `chat/` domain** (the real work)
- `router.py` — SSE streaming endpoint
- `tools.py` — tool registry wired to existing services
- `service.py` — Claude API integration, conversation state
- `schemas.py` — message types, widget payloads
- `prompts.py` — system prompt, skill definitions
- New env var: `ANTHROPIC_API_KEY`
- Add `anthropic` to Python dependencies

**Step 3: Minor `main.py` updates**
- Register chat router in `api/v1/router.py`
- Optionally add a separate rate limit tier for `/chat/*` endpoints
- Add `"chat"` to `openapi_tags`

That's it. No changes to `core/`, `shared/`, or any of the existing domain logic.