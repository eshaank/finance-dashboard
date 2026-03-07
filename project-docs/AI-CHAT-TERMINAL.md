# AI Chat Terminal — Feature Plan

> Planning document for the AI-powered research chat page.
> **Status:** Planning
> **Date:** 2026-03-06

---

## Vision

A split-view research terminal where the user converses with an LLM in natural language on the left, and a persistent canvas on the right accumulates interactive charts, tables, and widgets as the LLM responds. The LLM has tool-use access to every data endpoint in the platform and can generate rich visuals on demand. The user can save prompt templates (simple now, multi-step workflows later) so common research routines are one click away.

The goal: ask a question about any company or economic topic and get a structured, visual answer — then keep asking follow-ups while your canvas fills with the data you care about.

---

## Page Layout

### Split-View Architecture

```
+------------------------------------------------------------------+
|  [Nav Tabs: Home | Research | Scanner | Economics | AI Terminal]  |
+------------------------------------------------------------------+
|                        |                                         |
|     CHAT PANEL         |         CANVAS PANEL                    |
|     (left, ~40%)       |         (right, ~60%)                   |
|                        |                                         |
|  +------------------+  |  +-----------------------------------+  |
|  | Conversation     |  |  |  [Widget] [Widget] [Widget]       |  |
|  | history scrolls  |  |  |                                   |  |
|  | here. Messages   |  |  |  Charts, tables, metrics cards    |  |
|  | are text-only —  |  |  |  accumulate here as the LLM       |  |
|  | visuals go to    |  |  |  responds. User can rearrange,    |  |
|  | the canvas. -->  |  |  |  resize, close, or fullscreen     |  |
|  |                  |  |  |  any widget.                      |  |
|  |                  |  |  |                                   |  |
|  |                  |  |  |  Canvas persists across messages  |  |
|  |                  |  |  |  until user clears it or starts   |  |
|  |                  |  |  |  a new session.                   |  |
|  +------------------+  |  +-----------------------------------+  |
|  +------------------+  |                                         |
|  | [input bar]  [>] |  |  [Clear Canvas] [Export] [Save Layout]  |
|  +------------------+  |                                         |
+------------------------------------------------------------------+
```

**Chat panel (left, ~40% width):**

- Scrollable message list (user bubbles + assistant bubbles)
- Assistant messages are text/markdown only — any visuals the LLM generates are sent to the canvas instead
- In-message references like "[see Chart 1 on canvas]" link the text to the corresponding canvas widget (click to highlight/scroll-to on canvas)
- Tool-calling transparency: a subtle collapsible section per message showing which tools were called (e.g., "Fetched AAPL balance sheet, AAPL price chart")
- Streaming text display — tokens appear in real-time as the LLM generates

**Canvas panel (right, ~60% width):**

- Grid-based layout (react-grid-layout, same library already used for the dashboard widgets per ADR-010)
- Widgets are draggable, resizable, closable, and fullscreen-able
- Each widget has a small header showing what it is ("AAPL Balance Sheet", "GDP vs Unemployment") and which message generated it
- Canvas persists for the duration of the session — new widgets are appended, old ones stay unless removed
- Canvas toolbar at bottom: Clear All, Export (screenshot/PDF of current canvas state), Save Layout (for template reuse)

**Responsive behavior:**

- Desktop: side-by-side split, resizable divider
- Tablet: stacked vertically (chat on top, canvas below) or toggle between views
- The split ratio should be adjustable by dragging the divider

---

## Chat Interface — Detailed Design

### Message Types

1. **User message** — plain text input from the user
2. **Assistant text** — markdown-rendered response from the LLM (no embedded visuals)
3. **Widget reference** — inline tag in assistant text linking to a canvas widget (e.g., a small pill/badge like `[Chart: AAPL 6M]` that highlights the widget on canvas when clicked)
4. **Tool activity** — collapsible section showing which data tools were invoked, with status indicators (loading spinner → checkmark)
5. **Error message** — when a tool call fails, shown inline with a retry option

### Input Bar

- Multi-line text input (auto-expanding, shift+enter for newline, enter to send)
- Send button
- Template picker button (opens template sidebar/modal)
- Attachment support (future: drop a CSV or paste a screenshot for the LLM to analyze)

### Streaming UX

- Tokens stream in real-time via SSE
- Tool calls appear as a "thinking" step before the text response begins:
  ```
  [Searching AAPL balance sheet data...]
  [Fetching AAPL 6-month price chart...]
  [Generating analysis...]
  ```
- Widgets pop onto the canvas as their data arrives (before the full text response finishes)
- If the LLM is generating a long response, the user can see widgets appearing on the canvas while the text is still streaming

### Conversation Context

- Full conversation history is sent with each request (up to a context window limit)
- The LLM maintains awareness of what's on the canvas and can reference previous widgets
- Follow-up questions work naturally: "Now compare that to MSFT" should understand "that" refers to the previous AAPL query

---

## Canvas Widgets — Types

Starting set of widget types that map to existing data endpoints:

| Widget Type | Data Source | Interactive Features |
|-------------|-----------|---------------------|
| **Price Chart** | `price-chart` endpoint | Timeframe toggle, zoom, OHLC tooltip |
| **Data Table** | Any tabular data (financials, ratios, etc.) | Sort, filter, column toggle, export CSV |
| **Metrics Card** | Extracted key metrics | Sparkline, comparison to prior period |
| **Comparison Table** | Multiple tickers side-by-side | Highlight best/worst, toggle metrics |
| **Line/Bar Chart** | Time-series data (economic, financial) | Zoom, toggle series, annotations |
| **Company Summary Card** | `company/details` endpoint | Logo, sector, market cap, key stats |
| **Short Interest Chart** | `short-interest` + `short-volume` | Dual axis, date range selector |
| **Economic Indicator** | `economic-data` endpoint | Multi-series overlay, recession bands |

Future widget types (post-launch):

- Treemap (sector allocation, market cap weighting)
- Heatmap (correlation matrix, sector performance grid)
- Scatter plot (custom X/Y axis selection)
- SEC filing viewer (inline document with highlights)
- News timeline (chronological event feed)

### Widget Behavior

- Each widget has a unique ID and is tracked in canvas state
- Widgets know their "source message" — the chat message that generated them
- Clicking a widget reference in chat highlights/scrolls to the widget on canvas
- Clicking a widget's "source" link scrolls to the originating message in chat
- Widgets are fully interactive independent of the chat (zoom charts, sort tables, etc.)
- Right-click or kebab menu on each widget: Fullscreen, Export (PNG/CSV), Remove, Refresh Data

---

## LLM Tool System — How the AI Decides What to Do

### Tool Categories

**Data retrieval tools** (fetch raw data from existing endpoints):

- `get_price_chart(ticker, timeframe)` → price-chart endpoint
- `get_company_details(ticker)` → company/details endpoint
- `get_balance_sheet(ticker)` → fundamentals/balance-sheet endpoint
- `get_income_statement(ticker)` → fundamentals/income-statement endpoint
- `get_cash_flow(ticker)` → fundamentals/cash-flow endpoint
- `get_ratios(ticker)` → fundamentals/ratios endpoint
- `get_short_interest(ticker)` → fundamentals/short-interest endpoint
- `get_short_volume(ticker)` → fundamentals/short-volume endpoint
- `get_float(ticker)` → fundamentals/float endpoint
- `get_economic_data()` → economic-data endpoint
- `get_inside_days(ticker)` → inside-days endpoint

**Rendering tools** (tell the frontend to create a widget):

- `render_price_chart(data, options)` → creates a Price Chart widget on canvas
- `render_table(columns, rows, options)` → creates a Data Table widget on canvas
- `render_metrics_card(metrics)` → creates a Metrics Card widget
- `render_comparison(tickers, metrics)` → creates a side-by-side comparison
- `render_chart(type, series, options)` → generic chart widget (line, bar, area)

The LLM decides which data tools to call based on the user's question, fetches the data, then uses rendering tools to send structured widget payloads to the canvas while also generating a text explanation.

### Tool Execution Flow

```
User asks: "How has Apple's balance sheet changed over the last 3 years?"

1. LLM decides to call: get_balance_sheet("AAPL") + get_price_chart("AAPL", "3Y")
2. Backend executes tools internally (direct service calls, no HTTP)
3. Raw data returned to LLM
4. LLM calls: render_table(balance_sheet_data) + render_price_chart(price_data)
5. Backend streams to frontend:
   - Widget payloads (canvas renders them immediately)
   - Text analysis (streamed token by token)
6. User sees: widgets appearing on canvas + text explanation streaming in chat
```

---

## Prompt Templates

### Phase 1: Simple Prompt Saves

A template is a saved prompt with optional placeholder variables.

**Template structure:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Full Company Report",
  "description": "Comprehensive financial analysis for any ticker",
  "category": "Company Analysis",
  "prompt": "Generate a comprehensive report on {{ticker}} including: balance sheet trends over the last 3 years, key financial ratios compared to industry averages, short interest analysis, recent price action, and a summary of financial health.",
  "variables": [
    { "name": "ticker", "label": "Stock Ticker", "type": "text", "placeholder": "AAPL" }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Template categories (starter set):**

- Company Analysis — single-company deep dives
- Comparison — side-by-side multi-ticker analysis
- Economic — macro data, Fed, indicators
- Screening — "find me stocks that match X criteria"
- Custom — user-defined

**Template UI:**

- Template picker accessible from the chat input bar (button or keyboard shortcut)
- Opens as a modal or slide-out panel showing saved templates organized by category
- Selecting a template fills in the variables (small form) then populates the chat input
- Quick-run option: if all variables are provided, sends immediately
- Templates are editable inline — modify the prompt and re-save

### Phase 2: Multi-Step Workflows (Future)

- A workflow is an ordered list of template steps
- Each step can reference outputs from previous steps
- Example: "Quarterly Earnings Prep" workflow:
  1. Pull latest income statement for {{ticker}}
  2. Compare revenue and margins to previous 4 quarters
  3. Pull short interest trends
  4. Generate summary report with key risks and opportunities
- Workflows execute sequentially, each step's widgets accumulate on canvas
- User can pause/resume/skip steps

---

## Conversation Persistence

### Database Schema (Supabase)

**`conversations` table:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users, RLS |
| title | text | Auto-generated or user-provided |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`messages` table:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| conversation_id | uuid | FK to conversations |
| role | text | "user" or "assistant" |
| content | text | Markdown text content |
| tool_calls | jsonb | Array of tool invocations and results |
| widget_data | jsonb | Array of widget payloads generated |
| created_at | timestamptz | |

**`prompt_templates` table:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users, RLS |
| name | text | |
| description | text | |
| category | text | |
| prompt | text | With {{variable}} placeholders |
| variables | jsonb | Variable definitions |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Conversation Sidebar

- Left edge of the chat panel (or toggle-able drawer)
- Lists past conversations with title, date, and preview of first message
- Search across conversations
- New conversation button
- Delete / rename conversations

---

## Build Phases

### Phase 1 — Core Chat Loop (MVP)

Goal: User can type a question and get a streamed text response with widgets on canvas.

1. **Backend:** New `domains/chat/` domain (router, service, schemas, tool registry)
2. **Backend:** LLM integration (Claude API with tool use) + SSE streaming endpoint
3. **Backend:** Wire up 4-5 existing services as tools (price chart, company details, balance sheet, income statement, economic data)
4. **Frontend:** Split-view page layout (chat panel + canvas panel)
5. **Frontend:** Chat message list with streaming text display
6. **Frontend:** Canvas with react-grid-layout, supporting 2-3 widget types (data table, price chart, company card)
7. **Frontend:** Wire SSE to both chat and canvas (text to chat, widget payloads to canvas)

### Phase 2 — Rich Widgets & Polish

Goal: Full widget library, tool transparency, refined UX.

8. Wire up all remaining backend endpoints as tools
9. Add remaining widget types (comparison table, metrics card, short interest chart, economic chart)
10. Tool-calling transparency UI in chat messages
11. Widget cross-referencing (click reference in chat → highlight on canvas, and vice versa)
12. Canvas toolbar (clear, export, fullscreen widgets)
13. Responsive layout (tablet/mobile stacking)

### Phase 3 — Templates & Persistence

Goal: Save and reuse prompts, preserve conversation history.

14. Supabase tables: `prompt_templates`, `conversations`, `messages`
15. Template CRUD (backend endpoints + frontend UI)
16. Template picker modal in chat input
17. Conversation save/load
18. Conversation sidebar with history list and search

### Phase 4 — Workflows & Power Features

Goal: Multi-step templates, export, advanced context.

19. Multi-step workflow templates (chained prompts)
20. Canvas export to PDF / image
21. Share conversation or canvas as a link
22. Suggested follow-up questions after each response
23. Canvas layout saving (remember arrangement for specific template types)
24. Context awareness improvements (LLM remembers canvas state across long sessions)

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM Provider | Claude API (tool use) | Native tool calling, strong reasoning for financial analysis |
| Streaming Protocol | SSE (Server-Sent Events) | Simpler than WebSockets, sufficient for unidirectional streaming, no WebSocket infra currently in stack |
| Tool Execution | Internal service calls (Python imports) | Avoids HTTP overhead, rate limiting, and auth for internal calls |
| Canvas Layout | react-grid-layout | Already used for dashboard widgets (ADR-010), proven in the codebase |
| Widget Data Contract | Typed discriminated union (`{ type: "chart", data: {...} }`) | Clean separation, frontend block renderer maps type → component |
| Template Storage | Supabase Postgres with RLS | First justified new tables beyond `profiles` — user-generated content, not market data |
| Conversation Storage | Supabase Postgres with RLS | Messages + widget data preserved as JSONB for full session replay |
| New env variable | `ANTHROPIC_API_KEY` | Required for Claude API calls from backend |

---

## Open Questions

- **Rate limiting for chat:** Should the chat endpoint have separate rate limits from data endpoints? LLM calls are expensive — consider per-user daily/hourly limits.
- **Context window management:** How to handle very long conversations that exceed the LLM's context window? Options: sliding window, summarization of older messages, or explicit "new topic" breaks.
- **Canvas state in context:** Should the LLM know what's currently on the canvas? Sending widget metadata with each request adds context but also token cost.
- **Cost visibility:** Should users see estimated token/cost usage per query? Helpful for awareness but might discourage usage.
- **Caching LLM responses:** Should identical questions return cached responses, or always generate fresh? Financial data changes — probably always fresh, but cache the underlying data tool results (already handled by TTLCache).
