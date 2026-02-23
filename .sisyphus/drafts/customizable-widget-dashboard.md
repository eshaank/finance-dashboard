# Draft: Customizable Widget Dashboard (Bloomberg Terminal Style)

## User's Goal
Create a Bloomberg Terminal-inspired customizable dashboard where users can create their own widgets on the home page.

## Architecture Analysis

### Current State
- **DashboardHome**: Empty placeholder with "Coming soon" message
- **Backend**: DDD with modular domains (market, research, fundamentals, scanner, economics)
- **Frontend**: React 19 + Vite, SWR for data fetching, Tailwind for styling
- **Auth**: Supabase Auth (invite-only), JWT verification
- **Database**: Supabase Postgres with only `profiles` table currently

### Available Data Sources (for widgets)
| Domain | Endpoints | Potential Widget Types |
|--------|-----------|------------------------|
| Market | `/market-indices`, `/price-chart?ticker=&timeframe=` | Index cards, Price charts |
| Research | `/company/details?ticker=` | Company info cards |
| Fundamentals | `/fundamentals/{type}?ticker=` | Financial statements tables |
| Scanner | `/inside-days?ticker=` | Inside day alerts |
| Economics | `/economic-data`, `/upcoming-events` | Economic calendar, indicators |

## Viability Assessment

### ✅ STRENGTHS (Why this is feasible)
1. **Modular Backend API** - Each domain is self-contained; widgets can consume endpoints independently
2. **SWR Caching** - Built-in deduplication and caching; perfect for multiple widgets consuming same data
3. **Supabase Postgres** - Already have database for user profiles; can extend for widget configurations
4. **Existing Components** - Card, Badge, Skeleton, etc. can be reused as widget containers
5. **Existing Hooks** - All data hooks follow same pattern (useSWR), easy to compose

### ❌ GAPS (What needs to be built)
1. **Drag-and-drop grid library** - Need react-grid-layout or similar
2. **Widget configuration storage** - New database table(s) for user layouts
3. **Widget registry system** - Define available widget types and their configurations
4. **Layout persistence** - Save/load user layouts from database
5. **Widget add/remove/edit UI** - User controls for managing widgets

## Technical Decisions Needed

### 1. Drag-and-Drop Library Choice
- **react-grid-layout** (Recommended) - Most popular, drag+resize, good for dashboards
- **dnd-kit** - Modern, accessible, but more manual grid work
- **react-dnd** - Lower-level, more control, more code

### 2. Widget Layout Storage Strategy
- **New table: `user_widgets`** - Stores layout configuration per user
- **Schema**: `{ id, user_id, widget_type, position (x,y), size (w,h), config (JSONB) }`
- **Requires ADR** per architecture rules

### 3. Widget Types (Initial Set)
What widgets should be available initially?

### 4. Default Layout
- Start with empty dashboard?
- Pre-configured default widgets?
- Template presets?

## Open Questions
- [ ] What specific widget types should be available?
- [ ] Should users configure widget parameters (e.g., which ticker for a price chart)?
- [ ] Grid layout preferences (columns, row height, max widgets)?
- [ ] Should layouts be shareable between users?
- [ ] Mobile/responsive considerations?

## Scope Boundaries
- INCLUDE: Widget drag-and-drop, resize, add/remove, layout persistence
- EXCLUDE: Real-time data updates (polling), widget sharing, custom widget creation by users
