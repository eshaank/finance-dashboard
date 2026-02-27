# Customizable Widget Dashboard

## TL;DR

> **Quick Summary**: Transform the empty DashboardHome into a Bloomberg Terminal-inspired customizable widget system with drag-and-drop, configurable widgets, and layout persistence.
>
> **Deliverables**:
> - Widget grid with drag-and-drop (react-grid-layout)
> - 5 widget types: MarketIndices, PriceChart, UpcomingEvents, EconomicCalendar, CompanyInfo
> - Widget configuration modals (ticker, timeframe, filters)
> - Backend API for layout persistence
> - Database table for user widget configs
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Backend domain → Frontend types → Widget components → Integration

---

## Context

### Original Request
Create a Bloomberg Terminal-inspired customizable dashboard where users can create their own widgets on the home page.

### Interview Summary
**Key Discussions**:
- Widget types: Full Set (Market indices, Price chart, Upcoming events, Economic calendar, Company info)
- Widget configuration: Full config (tickers, timeframes, filters)
- Default layout: Pre-configured default with MarketIndices + UpcomingEvents
- Mobile: Full responsive with touch support
- Test strategy: Tests after implementation

**Research Findings**:
- Backend uses DDD - adding new domain follows established pattern
- Frontend uses SWR - all hooks follow same pattern
- Database only has `profiles` table - needs `user_widgets` table
- Existing components (Card, Badge, Skeleton) reusable for widgets

---

## Work Objectives

### Core Objective
Replace the DashboardHome placeholder with a fully functional customizable widget dashboard that persists user layouts to the database.

### Concrete Deliverables
- Backend: New `widgets` domain with router, schemas, service, and Supabase client
- Backend: New `user_widgets` table with RLS
- Frontend: `react-grid-layout` integration
- Frontend: Widget registry system with 5 widget components
- Frontend: Widget add/remove/configure UI
- Frontend: Layout persistence hooks

### Definition of Done
- [ ] Users can add widgets from a palette
- [ ] Users can drag and resize widgets
- [ ] Users can configure widget parameters (ticker, timeframe, filters)
- [ ] Layout persists across sessions
- [ ] Works on mobile with touch
- [ ] Default layout shows for new users

### Must Have
- All 5 widget types functional
- Layout persistence to database
- Drag-and-drop working
- Widget configuration modals
- Responsive design

### Must NOT Have (Guardrails)
- No real-time data updates (polling)
- No widget sharing between users
- No custom widget creation by users
- No WebSocket connections
- No changes to existing domain routers (market, research, etc.)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: Tests after implementation
- **Framework**: vitest + @testing-library/react

### QA Policy
Every task includes agent-executed QA scenarios:
- **Frontend/UI**: Playwright (navigate, interact, assert DOM, screenshot)
- **API/Backend**: Bash (curl requests, assert status + response fields)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — infrastructure + types):
├── Task 1: Install react-grid-layout dependency [quick]
├── Task 2: Create widget types and interfaces [quick]
├── Task 3: Create ADR for user_widgets table [writing]
├── Task 4: Create backend widgets domain scaffolding [quick]
└── Task 5: Create Supabase migration for user_widgets [quick]

Wave 2 (After Wave 1 — backend API + frontend core):
├── Task 6: Backend widgets router + schemas [unspecified-high]
├── Task 7: Backend widgets service (CRUD operations) [unspecified-high]
├── Task 8: Frontend widget registry system [quick]
├── Task 9: Frontend useUserWidgets hook [quick]
└── Task 10: Frontend WidgetContainer component [visual-engineering]

Wave 3 (After Wave 2 — widget implementations):
├── Task 11: MarketIndicesWidget component [visual-engineering]
├── Task 12: PriceChartWidget component [visual-engineering]
├── Task 13: UpcomingEventsWidget component [visual-engineering]
├── Task 14: EconomicCalendarWidget component [visual-engineering]
└── Task 15: CompanyInfoWidget component [visual-engineering]

Wave 4 (After Wave 3 — integration + configuration):
├── Task 16: WidgetPalette component (add widgets) [visual-engineering]
├── Task 17: WidgetConfigModal component [visual-engineering]
├── Task 18: DashboardHome rewrite with widget grid [visual-engineering]
├── Task 19: Default layout initialization [unspecified-high]
└── Task 20: Responsive/mobile touch support [visual-engineering]

Wave FINAL (After ALL tasks — verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

### Dependency Matrix

- **1-5**: No dependencies (can run in parallel)
- **6**: 4, 5 — 11-15, 6
- **7**: 4, 5 — 6, 2
- **8**: 2 — 11-15, 8
- **9**: 2, 6 — 18, 9
- **10**: 8 — 11-15, 10
- **11-15**: 8, 10 — 18, 11-15
- **16**: 8 — 18, 16
- **17**: 8 — 18, 17
- **18**: 9, 10, 11-15 — 19, 18
- **19**: 6, 18 — 20, 19
- **20**: 18 — F1-F4, 20

### Agent Dispatch Summary

- **Wave 1**: 5 tasks → T1,T2,T4,T5 → `quick`, T3 → `writing`
- **Wave 2**: 5 tasks → T6,T7 → `unspecified-high`, T8,T9 → `quick`, T10 → `visual-engineering`
- **Wave 3**: 5 tasks → T11-T15 → `visual-engineering`
- **Wave 4**: 5 tasks → T16,T17,T18,T20 → `visual-engineering`, T19 → `unspecified-high`
- **Wave FINAL**: 4 tasks → F1 → `oracle`, F2,F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Install react-grid-layout dependency

  **What to do**:
  - Add `react-grid-layout` to frontend/package.json
  - Install the dependency with npm

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocked By**: None

  **References**:
  - `frontend/package.json`

  **QA Scenarios**:
  ```
  Scenario: Dependency installs correctly
    Tool: Bash
    Steps: cd frontend && npm list react-grid-layout
    Expected Result: Package listed
    Evidence: .sisyphus/evidence/task-01-install.txt
  ```

- [ ] 2. Create widget types and interfaces

  **What to do**:
  - Create `frontend/src/types/widgets.ts`
  - Define WidgetType, WidgetConfig, WidgetLayout, UserWidget interfaces

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**: YES, Wave 1
  **References**: `frontend/src/types/index.ts`

  **QA Scenarios**:
  - cd frontend && npx tsc --noEmit → PASS

- [ ] 3. Create ADR for user_widgets table

  **What to do**:
  - Add ADR-010 to `project-docs/DECISIONS.md`

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**: YES, Wave 1
  **References**: `project-docs/DECISIONS.md`

- [ ] 4. Create backend widgets domain scaffolding

  **What to do**:
  - Create `backend/app/domains/widgets/` with __init__.py, router.py, schemas.py, service.py

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**: YES, Wave 1
  **References**: `backend/app/domains/market/`

- [ ] 5. Create Supabase migration for user_widgets

  **What to do**:
  - Create migration for `user_widgets` table with RLS

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**: YES, Wave 1

- [ ] 6. Backend widgets router + schemas

  **What to do**:
  - Implement GET/POST/PUT/DELETE /widgets endpoints
  - Define UserWidgetSchema, WidgetLayoutSchema

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**: NO, depends on 4,5

- [ ] 7. Backend widgets service (CRUD)

  **What to do**:
  - Implement get_user_widgets, create_widget, update_widget, delete_widget

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**: NO, depends on 4,5

- [ ] 8. Frontend widget registry system

  **What to do**:
  - Create `frontend/src/widgets/registry.ts`
  - Define WIDGET_REGISTRY with metadata for each widget type

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**: YES (with 9,10), depends on 2

- [ ] 9. Frontend useUserWidgets hook

  **What to do**:
  - Create useSWR hook for fetching/saving widget layouts

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**: YES (with 8,10), depends on 2,6

- [ ] 10. Frontend WidgetContainer component

  **What to do**:
  - Create draggable/resizable container wrapper
  - Integrate with react-grid-layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: ['ui-ux-pro-max', 'tailwind-design-system']

  **Parallelization**: YES (with 8,9), depends on 8

- [ ] 11. MarketIndicesWidget component

  **What to do**:
  - Wrap existing MarketIndicesGrid in widget container

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: YES (with 12-15), depends on 8,10

- [ ] 12. PriceChartWidget component

  **What to do**:
  - Create configurable price chart widget with ticker/timeframe params

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: YES (with 11,13-15)

- [ ] 13. UpcomingEventsWidget component

  **What to do**:
  - Create widget showing upcoming economic events

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: YES (with 11,12,14,15)

- [ ] 14. EconomicCalendarWidget component

  **What to do**:
  - Create widget showing economic data calendar

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: YES (with 11-13,15)

- [ ] 15. CompanyInfoWidget component

  **What to do**:
  - Create configurable company info widget with ticker param

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: YES (with 11-14)

- [ ] 16. WidgetPalette component

  **What to do**:
  - Create sidebar/modal for adding new widgets

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: NO, depends on 8

- [ ] 17. WidgetConfigModal component

  **What to do**:
  - Create modal for configuring widget parameters

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: NO, depends on 8

- [ ] 18. DashboardHome rewrite

  **What to do**:
  - Replace placeholder with actual widget grid
  - Integrate react-grid-layout with all components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: NO, depends on 9,10,11-15

- [ ] 19. Default layout initialization

  **What to do**:
  - Create default widget layout for new users
  - Implement first-time user detection

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**: NO, depends on 6,18

- [ ] 20. Responsive/mobile touch support

  **What to do**:
  - Configure react-grid-layout for mobile breakpoints
  - Test touch drag/drop

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**: NO, depends on 18



---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify all Must Have items implemented, all Must NOT Have absent, evidence files exist.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `eslint` + `vitest`. Check for AI slop patterns.

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright` skill
  Execute every QA scenario, capture evidence, test integration.

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 mapping between plan spec and implementation.

---

## Commit Strategy

- **Task 1**: `feat(widgets): add react-grid-layout dependency`
- **Tasks 2-5**: `feat(widgets): add types and backend scaffolding`
- **Tasks 6-7**: `feat(widgets): implement backend API endpoints`
- **Tasks 8-10**: `feat(widgets): add frontend core infrastructure`
- **Tasks 11-15**: `feat(widgets): implement widget components`
- **Tasks 16-20**: `feat(widgets): complete dashboard integration`
- **Final**: `feat(widgets): customizable widget dashboard complete`

---

## Success Criteria

### Verification Commands
```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend tests
cd frontend && npx vitest run

# Type check
cd frontend && npx tsc --noEmit

# Build
cd frontend && npm run build
```

### Final Checklist
- [ ] All 5 widget types render correctly
- [ ] Drag-and-drop works on desktop and mobile
- [ ] Widget configuration modals functional
- [ ] Layout saves to database
- [ ] Layout loads on refresh
- [ ] New users see default layout
- [ ] No TypeScript errors
- [ ] All tests pass
