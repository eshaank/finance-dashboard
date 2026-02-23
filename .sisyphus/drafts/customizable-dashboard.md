# Draft: Bloomberg-Style Customizable Dashboard

## Requirements (confirmed)
- User wants Bloomberg Terminal-inspired customizable widgets
- Home page (`DashboardHome`) is currently a placeholder
- Goal: Allow users to create/configure their own widgets on the dashboard

## Research Findings

### Current Architecture
- **Backend**: FastAPI with DDD structure (domains: market, research, fundamentals, scanner, economics, fred)
- **Frontend**: React 19 + Vite + SWR for data fetching
- **Auth**: Supabase Auth (invite-only) with JWT verification
- **Database**: Supabase Postgres (only `profiles` table exists currently)
- **API Design**: RESTful, versioned (`/api/v1/`), all endpoints require auth

### Available Data Endpoints (widgets can consume these)
| Domain | Endpoints | Data Type |
|--------|-----------|-----------|
| market | `/market-indices`, `/price-chart` | Index prices, OHLC charts |
| research | `/company/details` | Company info, logos |
| fundamentals | `/fundamentals/*` | Balance sheets, cash flow, income, ratios, short interest |
| scanner | `/inside-days` | Inside day patterns |
| economics | `/economic-data`, `/upcoming-events` | Economic indicators, calendar |

### Existing Widget-like Components
- `MarketIndicesGrid` - Index cards in a 2x4 grid
- `RecentDataTable` - Economic data table
- `UpcomingEventsPanel` - Events calendar
- All use consistent `glass-card` styling pattern

### Gap Analysis
- No persistence layer for user layouts/preferences
- No drag-and-drop / grid layout system
- No widget configuration UI
- No widget registry/definition system

## Requirements → ANSWERED

### Widget Selection
**Market Indices** | **Price Chart** | **Company Details** | **Fundamentals Table**

### Layout System
**Drag-and-drop grid** — react-grid-layout style with snap-to-grid

### Persistence
**Supabase database** — new `dashboard_layouts` table

### Widget Configuration (Per-Widget Settings)
| Widget Type | Configurable Settings |
|-------------|---------------------|
| Market Indices | None (fixed display of all indices) |
| Price Chart | `ticker` (string), `timeframe` (1D/1W/1M/6M/12M/5Y/Max) |
| Company Details | `ticker` (string) |
| Fundamentals Table | `ticker` (string), `statementType` (balance-sheet/cash-flow/income-statement/ratios) |

### Resize Behavior
**Full resize** — users can adjust both width and height

### Default Layout (New Users)
- Market Indices widget (full width, default height)
- Price Chart widget (AAPL, 6M timeframe)

### Test Strategy
**Tests after** — build widgets first, add tests for key flows after
## Scope Boundaries
- INCLUDE: Home page customization, 4 widget types, drag-and-drop, resize, persistence
- EXCLUDE: Real-time websockets, widget marketplace, advanced animations
- FUTURE: Additional widget types, layout templates sharing
