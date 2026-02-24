# US Markets Page Enhancement

## TL;DR

> **Quick Summary**: Transform the existing Research/Scanner tabs into a unified Markets section with 3 sub-pages (Dashboard, Research, Scanner). Add TradingView heatmap, technical chart overlays (SMA/EMA/RSI/MACD), volume bars, news headlines, and dividend data.
> 
> **Deliverables**:
> - Markets section with Dashboard, Research, Scanner sub-pages
> - TradingView heatmap widget in Dashboard
> - Enhanced price charts with technical overlays + volume bars
> - News headlines section in Research
> - Dividend data in financials
> - New backend endpoints for technical indicators, news, dividends
> 
> **Estimated Effort**: Large (multiple backend + frontend domains)
> **Parallel Execution**: YES — 4-5 waves with max parallelism
> **Critical Path**: Git setup → Backend domains → Frontend structure → Integration → Testing

---

## Context

### Original Request
Create a US markets page for comprehensive ticker research from one place. Enhance existing Research tab with better charts, more data, and improved UI.

### Interview Summary
**Key Discussions**:
- Page structure: 3 sub-pages by workflow (Dashboard, Research, Scanner)
- Dashboard: Market indices + TradingView heatmap embed
- Research: Enhanced charts (overlays, volume), news, dividends
- Scanner: Keep existing, move to new structure
- Integration: Replace existing tabs with Markets section
- Testing: Tests after implementation

**Research Findings**:
- Massive API supports all requested features: news, dividends, technical indicators
- Existing patterns: ScannerTab layout, ResearchTab multi-section, glass-card styling
- TradingView widget is external embed (no backend needed)

### Scope Boundaries
- **INCLUDE**: Dashboard (indices + heatmap), Research (charts + financials + news), Scanner (existing)
- **EXCLUDE**: Mobile UI, options flow, insider trading, watchlists, DB changes

---

## Work Objectives

### Core Objective
Create a unified Markets section that consolidates all ticker research capabilities with enhanced visualizations and data coverage.

### Concrete Deliverables
1. Markets navigation with 3 sub-pages (Dashboard, Research, Scanner)
2. Dashboard page with market indices + TradingView heatmap
3. Research page with enhanced charts (overlays, volume), news, dividends
4. Backend endpoints: `/api/v1/news`, `/api/v1/fundamentals/dividends`, `/api/v1/technical/*`
5. New frontend hooks: useNews, useDividends, useTechnicalIndicator

### Definition of Done
- [ ] Markets section accessible from main navigation
- [ ] Dashboard shows indices + TradingView heatmap
- [ ] Research displays price chart with overlays (SMA/EMA/RSI/MACD)
- [ ] Research shows news headlines for ticker
- [ ] Research shows dividend data in financials
- [ ] Scanner works identically to before (just moved)
- [ ] All existing Research/Scanner functionality preserved
- [ ] No TypeScript errors, all tests pass

### Must Have
- 3 sub-pages under Markets
- Technical overlays on charts
- Volume bars on charts
- News headlines
- Dividend data

### Must NOT Have (Guardrails)
- NO mobile UI optimization
- NO options flow or insider trading features
- NO watchlists or saved searches
- NO fundamental changes to Scanner logic
- NO database schema changes

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: YES (tests after implementation)
- **Framework**: vitest

### QA Policy
Every task includes agent-executed QA scenarios with Playwright for UI and curl for API.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Git Setup — MUST BE SEQUENTIAL):
├── Task 1: Stash changes, checkout main, pull, create branch [git]
└── NO PARALLELISM — blocks all other work

Wave 1 (Backend Foundation — MAX PARALLEL):
├── Task 2: Technical indicators domain (sma, ema, rsi, macd endpoints) [unspecified-high]
├── Task 3: News domain + endpoint [unspecified-high]
├── Task 4: Dividends endpoint in fundamentals [unspecified-high]
├── Task 5: Enhance ratios endpoint with growth metrics [quick]
└── Task 6: Backend types for new endpoints [quick]

Wave 2 (Frontend Foundation — MAX PARALLEL):
├── Task 7: Create markets/ folder structure [quick]
├── Task 8: MarketsLayout + MarketsNav components [visual-engineering]
├── Task 9: Update NavTabs for Markets section [quick]
├── Task 10: Frontend types for News, Dividend, TechnicalIndicator [quick]
├── Task 11: useNews hook [quick]
├── Task 12: useDividends hook [quick]
└── Task 13: useTechnicalIndicator hook [quick]

Wave 3 (Feature Components — PARALLEL):
├── Task 14: DashboardTab with indices + heatmap [visual-engineering]
├── Task 15: TradingViewHeatmap embed component [quick]
├── Task 16: Move Scanner components to markets/scanner [quick]
├── Task 17: NewsSection component [visual-engineering]
├── Task 18: DividendSection component [visual-engineering]
├── Task 19: ChartOverlays controls [visual-engineering]
└── Task 20: Enhance PriceChart with volume + overlays [visual-engineering]

Wave 4 (Integration — SEQUENTIAL DEPENDENCIES):
├── Task 21: Wire DashboardTab into MarketsLayout [quick]
├── Task 22: Wire ResearchTab with new features [quick]
├── Task 23: Wire ScannerTab into MarketsLayout [quick]
└── Task 24: Update App.tsx routing [quick]

Wave 5 (Cleanup + Testing):
├── Task 25: Remove old Research/Scanner nav items [quick]
├── Task 26: Clean up unused imports/exports [quick]
├── Task 27: Backend tests for new endpoints [unspecified-high]
├── Task 28: Frontend component tests [unspecified-high]
└── Task 29: E2E verification [unspecified-high]

Critical Path: Task 1 → Wave 1 → Wave 2 → Wave 4 → Wave 5
Parallel Speedup: ~60% faster than sequential
```

---

## TODOs


- [ ] 1. Git Setup — Stash, Branch from Main

  **What to do**:
  - Stash all current changes on scanner-results branch
  - Checkout main branch
  - Pull latest from remote
  - Create new branch `feat/us-markets-page`
  - Push to remote with -u flag

  **Must NOT do**:
  - DO NOT commit the stashed changes to this branch
  - DO NOT skip pulling latest from main

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: ALL other tasks

  **References**:
  - `.gitignore` — Verify no secrets will be committed

  **Acceptance Criteria**:
  - [ ] `git branch --show-current` returns `feat/us-markets-page`
  - [ ] Branch created from latest main

  **QA Scenarios**:
  - Tool: Bash
  - Steps: `git branch --show-current`
  - Expected: `feat/us-markets-page`
  - Evidence: `.sisyphus/evidence/task-01-branch.txt`

  **Commit**: NO (git setup)

---

- [ ] 2. Backend — Technical Indicators Domain

  **What to do**:
  - Create `backend/app/domains/technical/` with router, client, service, schemas
  - Endpoints: `/sma`, `/ema`, `/rsi`, `/macd`
  - Register router in `api/v1/router.py`

  **Must NOT do**:
  - DO NOT duplicate client code — reuse `shared/http_client.py`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`fastapi-templates`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 20 (chart overlays)

  **References**:
  - `backend/app/domains/market/router.py` — Router pattern
  - `.claude/skills/massive-api/references/stocks_commands.md:141-241` — Indicator params

  **Acceptance Criteria**:
  - [ ] `GET /api/v1/technical/sma?ticker=AAPL` returns 200
  - [ ] All 4 indicators working

  **QA Scenarios**:
  - Tool: curl
  - Steps: `curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/technical/sma?ticker=AAPL"`
  - Expected: 200 OK with indicator data
  - Evidence: `.sisyphus/evidence/task-02-sma.json`

  **Commit**: YES
  - Message: `feat(technical): add SMA/EMA/RSI/MACD endpoints`

---

- [ ] 3. Backend — News Domain

  **What to do**:
  - Create `backend/app/domains/news/` with router, client, service, schemas
  - Endpoint: `GET /news?ticker=`
  - Register router in `api/v1/router.py`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`fastapi-templates`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 11, Task 17

  **References**:
  - `backend/app/domains/research/router.py` — Ticker endpoint pattern
  - `.claude/skills/massive-api/references/news_commands.md` — News params

  **Acceptance Criteria**:
  - [ ] `GET /api/v1/news?ticker=AAPL` returns news array

  **QA Scenarios**:
  - Tool: curl
  - Expected: 200 OK with articles array
  - Evidence: `.sisyphus/evidence/task-03-news.json`

  **Commit**: YES
  - Message: `feat(news): add news endpoint`

---

- [ ] 4. Backend — Dividends Endpoint

  **What to do**:
  - Add to `backend/app/domains/fundamentals/`
  - Endpoint: `GET /fundamentals/dividends?ticker=`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`fastapi-templates`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 12, Task 18

  **References**:
  - `backend/app/domains/fundamentals/router.py` — Existing endpoints
  - `.claude/skills/massive-api/references/reference_commands.md:107-131` — Dividends

  **Acceptance Criteria**:
  - [ ] `GET /api/v1/fundamentals/dividends?ticker=AAPL` returns dividend history

  **Commit**: YES
  - Message: `feat(fundamentals): add dividends endpoint`

---

- [ ] 5. Backend — Enhance Ratios Endpoint

  **What to do**:
  - Update `backend/app/domains/fundamentals/schemas.py` to include growth metrics
  - Add fields: revenue_growth, earnings_growth, margin trends

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)

  **Commit**: YES
  - Message: `feat(fundamentals): add growth metrics to ratios`

---

- [ ] 6. Backend — Types for New Endpoints

  **What to do**:
  - Add types to `backend/app/domains/*/schemas.py` for consistency

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)

  **Commit**: NO (bundled with domain tasks)

---

- [ ] 7. Frontend — Create markets/ Folder Structure

  **What to do**:
  - Create `frontend/src/components/markets/`
  - Create subfolders: `dashboard/`, `research/`, `scanner/`
  - Create index.ts barrel exports

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Tasks 14-24

  **Commit**: YES
  - Message: `feat(markets): create folder structure`

---

- [ ] 8. Frontend — MarketsLayout + MarketsNav

  **What to do**:
  - Create `MarketsLayout.tsx` — Wrapper with sub-page routing
  - Create `MarketsNav.tsx` — Sub-tabs for Dashboard/Research/Scanner
  - Style with existing patterns (pill buttons, glass-card)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`, `vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Tasks 21-23

  **References**:
  - `frontend/src/components/scanner/ScannerTab.tsx` — Sub-tab pattern
  - `frontend/src/components/layout/NavTabs.tsx` — Navigation pattern

  **Commit**: YES
  - Message: `feat(markets): add MarketsLayout and MarketsNav`

---

- [ ] 9. Frontend — Update NavTabs

  **What to do**:
  - Add "Markets" to `NavTabs.tsx`
  - Set Markets as default tab

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)

  **Commit**: NO (bundled with Task 8)

---

- [ ] 10. Frontend — Types for News/Dividend/TechnicalIndicator

  **What to do**:
  - Add to `frontend/src/types/index.ts`:
    - `NewsArticle`
    - `Dividend`
    - `TechnicalIndicator`

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Tasks 11-13

  **References**:
  - `frontend/src/types/index.ts` — Existing types

  **Commit**: YES
  - Message: `feat(types): add News, Dividend, TechnicalIndicator types`

---

- [ ] 11. Frontend — useNews Hook

  **What to do**:
  - Create `frontend/src/hooks/useNews.ts`
  - Fetch from `/api/v1/news?ticker=`

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 17

  **References**:
  - `frontend/src/hooks/useCompany.ts` — Hook pattern

  **Commit**: YES
  - Message: `feat(hooks): add useNews`

---

- [ ] 12. Frontend — useDividends Hook

  **What to do**:
  - Create `frontend/src/hooks/useDividends.ts`
  - Fetch from `/api/v1/fundamentals/dividends?ticker=`

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 18

  **Commit**: YES
  - Message: `feat(hooks): add useDividends`

---

- [ ] 13. Frontend — useTechnicalIndicator Hook

  **What to do**:
  - Create `frontend/src/hooks/useTechnicalIndicator.ts`
  - Fetch from `/api/v1/technical/{type}?ticker=`
  - Accept type param: 'sma' | 'ema' | 'rsi' | 'macd'

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 20

  **Commit**: YES
  - Message: `feat(hooks): add useTechnicalIndicator`

---

- [ ] 14. Frontend — DashboardTab Component

  **What to do**:
  - Create `frontend/src/components/markets/dashboard/DashboardTab.tsx`
  - Include MarketIndicesGrid
  - Include TradingViewHeatmap widget
  - Layout: Two-column or stacked based on screen

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: Task 21

  **References**:
  - `frontend/src/components/market/MarketIndicesGrid.tsx` — Existing grid
  - `frontend/src/components/layout/DashboardHome.tsx` — Dashboard layout

  **Commit**: YES
  - Message: `feat(markets): add DashboardTab`

---

- [ ] 15. Frontend — TradingViewHeatmap Component

  **What to do**:
  - Create `frontend/src/components/markets/dashboard/TradingViewHeatmap.tsx`
  - Embed TradingView Stock Heatmap widget
  - Reference: https://www.tradingview.com/widget-docs/widgets/heatmaps/stock-heatmap/

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: Task 14

  **Commit**: YES
  - Message: `feat(markets): add TradingViewHeatmap widget`

---

- [ ] 16. Frontend — Move Scanner Components

  **What to do**:
  - Move `frontend/src/components/scanner/*` to `frontend/src/components/markets/scanner/`
  - Update all imports
  - Create barrel export in index.ts

  **Must NOT do**:
  - DO NOT change Scanner logic — only move location

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: Task 23

  **Commit**: YES
  - Message: `refactor: move scanner to markets folder`

---

- [ ] 17. Frontend — NewsSection Component

  **What to do**:
  - Create `frontend/src/components/markets/research/NewsSection.tsx`
  - Display news headlines with summary, source, date
  - Link to original article
  - Use useNews hook

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: Task 3, Task 11

  **References**:
  - `frontend/src/components/research/FinancialsSection.tsx` — Section pattern

  **Commit**: YES
  - Message: `feat(markets): add NewsSection`

---

- [ ] 18. Frontend — DividendSection Component

  **What to do**:
  - Create `frontend/src/components/markets/research/DividendSection.tsx`
  - Display dividend history table
  - Show: ex-date, pay-date, amount, frequency, yield
  - Use useDividends hook

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: Task 4, Task 12

  **References**:
  - `frontend/src/components/research/FinancialsSection.tsx` — Table pattern

  **Commit**: YES
  - Message: `feat(markets): add DividendSection`

---

- [ ] 19. Frontend — ChartOverlays Controls

  **What to do**:
  - Create `frontend/src/components/ui/ChartOverlays.tsx`
  - Toggle buttons for SMA, EMA, RSI, MACD
  - Input for window size (e.g., 50 for SMA)
  - State management for active overlays

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: Task 20

  **References**:
  - `frontend/src/components/research/SubTabNav.tsx` — Toggle pattern

  **Commit**: YES
  - Message: `feat(ui): add ChartOverlays controls`

---

- [ ] 20. Frontend — Enhance PriceChart with Volume + Overlays

  **What to do**:
  - Update `frontend/src/components/research/PriceChart.tsx` (move to markets/research/)
  - Add volume bars below main chart
  - Add overlay rendering for SMA/EMA lines
  - Add RSI/MACD as separate sub-charts below
  - Integrate ChartOverlays component
  - Improve candlestick styling

  **Must NOT do**:
  - DO NOT break existing chart functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`ui-ux-pro-max`, `vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: Task 2, Task 13, Task 19

  **References**:
  - `frontend/src/components/research/PriceChart.tsx` — Existing chart
  - `frontend/src/components/scanner/InsideDayChart.tsx` — Chart patterns

  **Commit**: YES
  - Message: `feat(charts): add volume bars and technical overlays`

---

- [ ] 21. Frontend — Wire DashboardTab

  **What to do**:
  - Import DashboardTab in MarketsLayout
  - Add routing for sub-tab "dashboard"
  - Ensure indices + heatmap render correctly

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4)
  - **Blocked By**: Task 8, Task 14

  **Commit**: NO (bundled with Task 24)

---

- [ ] 22. Frontend — Wire ResearchTab with New Features

  **What to do**:
  - Move ResearchTab to markets/research/
  - Add NewsSection to sub-tabs
  - Add DividendSection to financials
  - Add ChartOverlays to PriceChart

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4)
  - **Blocked By**: Task 17, Task 18, Task 20

  **Commit**: NO (bundled with Task 24)

---

- [ ] 23. Frontend — Wire ScannerTab into MarketsLayout

  **What to do**:
  - Import moved ScannerTab in MarketsLayout
  - Add routing for sub-tab "scanner"
  - Verify scanner works identically to before

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4)
  - **Blocked By**: Task 16

  **Commit**: NO (bundled with Task 24)

---

- [ ] 24. Frontend — Update App.tsx Routing

  **What to do**:
  - Update App.tsx to use MarketsLayout instead of separate Research/Scanner tabs
  - Remove old Research/Scanner tab logic
  - Set Markets as default view

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4)
  - **Blocked By**: Tasks 21, 22, 23

  **References**:
  - `frontend/src/App.tsx` — Current routing

  **Commit**: YES
  - Message: `feat(routing): integrate Markets section`

---

- [ ] 25. Frontend — Remove Old Nav Items

  **What to do**:
  - Remove Research and Scanner from NavTabs.tsx
  - Keep Markets as the new entry point

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)

  **Commit**: YES
  - Message: `refactor(nav): remove old Research/Scanner tabs`

---

- [ ] 26. Frontend — Clean Up Unused Imports

  **What to do**:
  - Remove old imports from moved components
  - Clean up barrel exports
  - Run `npx tsc --noEmit` to verify

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)

  **Commit**: YES
  - Message: `refactor: clean up unused imports`

---

- [ ] 27. Backend — Tests for New Endpoints

  **What to do**:
  - Add tests for `/api/v1/technical/*` endpoints
  - Add tests for `/api/v1/news` endpoint
  - Add tests for `/api/v1/fundamentals/dividends` endpoint
  - Run `pytest tests/ -v`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: Tasks 2, 3, 4

  **Commit**: YES
  - Message: `test: add tests for technical/news/dividends endpoints`

---

- [ ] 28. Frontend — Component Tests

  **What to do**:
  - Add tests for MarketsNav component
  - Add tests for NewsSection component
  - Add tests for DividendSection component
  - Run `npx vitest run`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: Tasks 17, 18, 19

  **Commit**: YES
  - Message: `test: add frontend component tests`

---

- [ ] 29. E2E Verification

  **What to do**:
  - Verify Dashboard shows indices + heatmap
  - Verify Research shows enhanced chart with overlays
  - Verify Research shows news + dividends
  - Verify Scanner works identically
  - Capture screenshots as evidence

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: All implementation tasks

  **Commit**: YES
  - Message: `test: add E2E verification`


---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify all Must Have items exist, all Must NOT Have items absent.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run tsc, linter, tests. Check for AI slop patterns.

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright`
  Execute all QA scenarios, capture evidence.

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 mapping between plan tasks and actual implementation.

---

## Commit Strategy

Commits grouped by wave/feature:
1. Git setup + branch creation
2. Backend technical indicators domain
3. Backend news + dividends endpoints
4. Frontend markets structure
5. Frontend Dashboard + Research enhancements
6. Integration + cleanup
7. Tests

---

## Success Criteria

### Verification Commands
```bash
# Backend
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/news?ticker=AAPL"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/fundamentals/dividends?ticker=AAPL"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/technical/sma?ticker=AAPL"

# Frontend
cd frontend && npm run build  # Should succeed
cd frontend && npx tsc --noEmit  # No errors

# Tests
cd backend && python3 -m pytest tests/ -v
cd frontend && npx vitest run
```

### Final Checklist
- [ ] Markets section in navigation
- [ ] Dashboard shows indices + heatmap
- [ ] Research shows enhanced charts with overlays
- [ ] Research shows news headlines
- [ ] Research shows dividend data
- [ ] Scanner unchanged (just moved)
- [ ] All tests pass
- [ ] No TypeScript errors
