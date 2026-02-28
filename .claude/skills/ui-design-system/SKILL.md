---
name: ui-design-system
description: "MANDATORY for all UI work. Dark terminal-finance design system: compact data-dense layouts, glass-card components, monospace numbers, minimal padding. Load this skill BEFORE writing or modifying any frontend component. Covers colors, typography, spacing, component patterns, and anti-patterns."
metadata:
  author: eshaank
  version: "1.0.0"
---

# Finance Dashboard — UI Design System

> **This is the single source of truth for all UI decisions.**
> Every component you build MUST follow these patterns exactly.
> When in doubt, look at the Markets page components as the reference implementation.

---

## CRITICAL: Compactness is King

**The #1 mistake LLMs make is building UI that is too large, too spread out, and too padded.**

This dashboard follows a **Bloomberg Terminal / professional trading desk** aesthetic. Every pixel matters. Data density is the goal — users want to see MORE information in LESS space, not the other way around.

### The Compactness Rules (NEVER VIOLATE)

1. **Card padding is `p-3` (12px), NEVER `p-4`, `p-5`, `p-6`, or larger**
2. **Row height is `min-h-[32px]` with `py-1.5` — NOT `py-3`, `py-4`, or larger**
3. **Section gaps are `gap-4` (16px) between cards, `space-y-1` (4px) between rows**
4. **Header margin is `mb-2` (8px), NEVER `mb-4`, `mb-6`, or larger**
5. **Font sizes are tiny: body is `text-xs` (12px), metadata is `text-[10px]`, badges are `text-[9px]`**
6. **The largest text on any card is `text-sm` (14px) for the card title**
7. **NEVER use `text-lg`, `text-xl`, `text-2xl` or larger on card content** (exception: hero price displays like market quotes)
8. **NEVER add decorative whitespace, large icons, illustrations, or empty padding to "make it look nice"**
9. **Rows should feel like a tight data table, not a list of cards**
10. **Negative margins (`-mx-2`) extend hover states to card edges — rows bleed to the gutter**

### What "Too Large" Looks Like (NEVER DO THIS)

```tsx
// BAD — everything is oversized
<div className="p-6 space-y-4">
  <h3 className="text-lg font-bold mb-4">Title</h3>
  <div className="py-3 px-4 rounded-xl bg-surface">
    <span className="text-base">AAPL</span>
    <span className="text-sm text-muted">$150.00</span>
  </div>
</div>
```

### What Correct Looks Like (ALWAYS DO THIS)

```tsx
// GOOD — compact, data-dense, tight
<article className="glass-card rounded-xl p-3 flex flex-col">
  <header className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold text-dash-text">Title</h3>
    <span className="text-[10px] text-dash-muted font-mono">5</span>
  </header>
  <div className="space-y-1">
    <div className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg
                    hover:bg-white/[0.03] min-h-[32px] cursor-pointer">
      <span className="text-xs font-mono font-semibold text-dash-text">AAPL</span>
      <span className="text-[10px] font-mono text-[#f97316]">$150.00</span>
    </div>
  </div>
</article>
```

---

## Color System

All colors are defined in `tailwind.config.ts`. NEVER use arbitrary hex values — use the semantic tokens.

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `dash-bg` | `#0a0a0a` | Page background |
| `dash-surface` | `#111111` | Card/panel backgrounds |
| `dash-surface-2` | `#18181c` | Nested containers |
| `dash-header` | `#161616` | App header bar |
| `dash-panel-header` | `#1a1a1a` | Widget panel headers |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `dash-text` | `#e0e0e0` | Primary readable text |
| `dash-muted` | `#666666` | Secondary/helper text |
| `white/30` | — | Ticker labels, icon tints |
| `white/20` | — | Timestamps, meta |
| `white/15` | — | Placeholder text |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `dash-green` | `#00cc66` | Positive/up trends |
| `dash-red` | `#ff4444` | Negative/down trends |
| `dash-yellow` | `#d29922` | Warnings, info, dividends |
| `#f97316` | — | Dollar amounts (orange) |
| `#3b82f6` | — | Economy category (blue) |
| `#a855f7` | — | Markets category (purple) |

### Accents
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#771128` | Primary accent (burgundy) |
| `accent-light` | `#9a2240` | Hover states |
| `accent-dark` | `#5a0d1e` | Pressed states |
| `accent-blue` | `#1a8fff` | Focus rings, active widget borders |

### Opacity Scale
- `white/[0.06]` — Card borders (glass-card)
- `white/[0.05]` — Table borders, dividers
- `white/[0.04]` — Skeleton loading backgrounds
- `white/[0.03]` — Row hover backgrounds
- `white/[0.025]` — Table row hover
- `color/15` — Icon background tints (e.g., `bg-dash-green/15`)
- `color/10` — Badge backgrounds (e.g., `bg-dash-green/10`)
- `color/20` — Badge borders (e.g., `border-dash-green/20`)

---

## Typography

### Font Families
- **Body**: `font-sans` → DM Sans
- **Numbers & Data**: `font-mono` → Geist Mono, JetBrains Mono
- **Display**: `font-display` → Playfair Display (rarely used)

### Font Size Scale (smallest to largest)
| Class | Size | Usage |
|-------|------|-------|
| `text-[9px]` | 9px | Badge labels, category tags |
| `text-[10px]` | 10px | Timestamps, metadata, dates, mono numbers in rows |
| `text-[11px]` | 11px | Descriptions, subtitles |
| `text-xs` | 12px | **DEFAULT body text**, ticker names, list items |
| `text-sm` | 14px | Card headers, news titles |
| `text-base` | 16px | Section headers only ("Key Markets") |
| `text-xl` | 20px | Hero price display only (KeyMarketsGrid quotes) |

**NEVER use `text-lg` (18px) or above for card content.** The jump from `text-sm` to `text-xl` is intentional — there is no in-between.

### Font Weight Patterns
- `font-semibold` — Headers, ticker names
- `font-medium` — Badge text, emphasis within body
- Default weight — Body paragraphs, descriptions
- `font-mono font-semibold` — Price values, tickers in data rows
- `font-mono font-medium` — Change percentages, ratios

### Text Conventions
- Tickers: `text-xs font-mono font-semibold text-dash-text` — always monospace, always semibold
- Dollar amounts: `text-[10px] font-mono text-[#f97316]` — orange, monospace
- Dates: `text-[10px] text-dash-muted font-mono`
- Percentages: `text-[11px] font-mono font-medium` with green/red coloring
- Labels: `text-[10px] font-mono text-white/30 uppercase tracking-wider`

---

## Layout Patterns

### Page-Level Layout
```tsx
// Outer container — minimal padding
<div className="px-1.5 md:px-3 py-2">
  // 5-column grid: 3 for main content, 2 for sidebar
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div className="lg:col-span-3 flex flex-col gap-4">
      {/* Primary content */}
    </div>
    <div className="lg:col-span-2 flex flex-col gap-4">
      {/* Sidebar content */}
    </div>
  </div>
</div>
```

### Dashboard Grid (multi-card row)
```tsx
// 3 equal cards side by side
<div className="grid grid-cols-3 gap-4">
  <IposCard />
  <SplitsCard />
  <DividendsCard />
</div>
```

### Quote Grid
```tsx
// 2 columns on mobile, 3 on desktop
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
```

### Spacing Rules
| Context | Class | Pixels |
|---------|-------|--------|
| Between cards | `gap-4` | 16px |
| Between rows in a list | `space-y-1` | 4px |
| Card padding | `p-3` | 12px |
| Header to content | `mb-2` | 8px |
| Quote card padding | `p-4` | 16px (exception: quote cards are slightly larger) |
| Section header to grid | `mb-3` | 12px |
| Page container padding | `px-1.5 md:px-3 py-2` | 6-12px horiz, 8px vert |

---

## Component Patterns

### Card (Standard Data Card)
The canonical pattern — IPOs, Splits, Dividends all use this exact structure:

```tsx
<article className="glass-card rounded-xl p-3 flex flex-col transition-all duration-200 ease-out">
  {/* Header: title left, count right */}
  <header className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold text-dash-text">Card Title</h3>
    <span className="text-[10px] text-dash-muted font-mono">{count}</span>
  </header>

  {/* Body: tight list of rows */}
  <div className="space-y-1 flex-1" role="list">
    {items.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg
                   group cursor-pointer transition-colors duration-150 ease-out
                   hover:bg-white/[0.03] min-h-[32px]"
        role="listitem"
        tabIndex={0}
      >
        {/* Left: ticker + secondary info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-dash-text">{item.ticker}</span>
          <span className="text-[10px] text-dash-muted">{item.meta}</span>
        </div>
        {/* Right: date + badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dash-muted font-mono">{item.date}</span>
          <Badge variant="muted" className="text-[9px] px-1.5 py-0.5">LABEL</Badge>
        </div>
      </div>
    ))}
  </div>
</article>
```

### Quote Card (Market Data)
Slightly larger for hero display — this is the ONE place large numbers are OK:

```tsx
<div className="bg-dash-surface border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
  <div className="flex items-start justify-between mb-1">
    <div>
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{ticker}</span>
      <p className="text-xs text-dash-muted mt-0.5">{name}</p>
    </div>
    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0',
      isUp ? 'bg-dash-green/15' : 'bg-dash-red/15')}>
      {isUp ? <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
             : <TrendingDown className="w-3.5 h-3.5 text-dash-red" />}
    </div>
  </div>
  <div className="mt-3 mb-2">
    <span className="text-xl font-mono font-semibold text-dash-text leading-none">{price}</span>
  </div>
  <div className="flex items-center gap-2">
    <span className={cn('text-xs font-mono font-medium', isUp ? 'text-dash-green' : 'text-dash-red')}>
      {change}
    </span>
    <span className={cn('text-[11px] font-mono font-medium px-1.5 py-0.5 rounded',
      isUp ? 'bg-dash-green/10 text-dash-green' : 'bg-dash-red/10 text-dash-red')}>
      {changePercent}
    </span>
  </div>
</div>
```

### Section Header
```tsx
<header className="flex items-baseline justify-between mb-3">
  <div>
    <h2 className="text-base font-semibold text-dash-text">Section Title</h2>
    <p className="text-[11px] text-dash-muted mt-0.5">Subtitle description</p>
  </div>
  <span className="text-[10px] text-white/20 font-mono">Status text</span>
</header>
```

### News Article
```tsx
<a href={url} target="_blank" className="group block py-4 first:pt-0 transition-colors duration-150">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full
                       bg-dash-red/15 text-dash-red">CATEGORY</span>
      <span className="flex items-center gap-1 text-[10px] text-white/25 font-mono">
        <Clock className="w-3 h-3" /> 5 min ago
      </span>
    </div>
    <ExternalLink className="w-3.5 h-3.5 text-white/15 group-hover:text-accent transition-colors" />
  </div>
  <h3 className="text-sm font-semibold leading-snug mb-1.5 group-hover:text-accent transition-colors duration-150">
    {title}
  </h3>
  <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2 mb-2.5">{description}</p>
  <p className="text-[10px] text-white/20">Source: <span className="font-medium text-dash-red">{publisher}</span></p>
</a>
```

### Table
```tsx
<table className="w-full text-xs">
  <thead>
    <tr className="border-b border-white/5">
      <th className="px-3 py-1.5 text-left text-[9px] font-medium uppercase tracking-widest text-white/30">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-t border-white/5 hover:bg-white/[0.025] transition-colors">
      <td className="py-1.5 px-3">
        <div className="text-[11px] font-medium text-dash-text leading-tight">{value}</div>
      </td>
    </tr>
  </tbody>
</table>
```

---

## Shared UI Components

### Badge
```tsx
<Badge variant="green | red | yellow | muted" className="text-[9px] px-1.5 py-0.5">
  LABEL
</Badge>
```

Variants:
- `green`: `bg-dash-green/10 text-dash-green border-dash-green/20`
- `red`: `bg-dash-red/10 text-dash-red border-dash-red/20`
- `yellow`: `bg-dash-yellow/10 text-dash-yellow border-dash-yellow/20`
- `muted`: `bg-white/5 text-dash-muted border-white/5`

Base: `inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium font-mono`

### Skeleton (Loading)
```tsx
<Skeleton className="h-3.5 w-16" />  // Single shimmer bar
```

Base: `rounded bg-white/[0.04] animate-pulse`

### Category Labels (News)
Rotating colors by topic:
- POLICY → `bg-dash-red/15 text-dash-red`
- ECONOMY → `bg-[#3b82f6]/15 text-[#3b82f6]`
- TRADE → `bg-[#f97316]/15 text-[#f97316]`
- MARKETS → `bg-[#a855f7]/15 text-[#a855f7]`
- FINANCE → `bg-dash-green/15 text-dash-green`

Pattern: `text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full`

---

## CSS Custom Classes

Defined in `frontend/src/index.css`:

| Class | Purpose |
|-------|---------|
| `.glass-card` | `rgba(17,17,17,0.95)` bg + `rgba(255,255,255,0.06)` border |
| `.glass-card-hover:hover` | Border brightens to `rgba(255,255,255,0.08)` |
| `.accent-glow` | `box-shadow: 0 0 30px rgba(119,17,40,0.35)` |
| `.grid-pattern` | Subtle 50px grid lines at `white 0.015` opacity |
| `.gradient-text` | White→burgundy gradient on text |
| `.pulse-dot` | 2s pulsing scale animation |
| `.terminal-workspace` | Full viewport below header, `#0a0a0a`, tabular-nums |
| `.terminal-panel` | `#111111` bg, `#2a2a2a` border, no radius |
| `.flash-green` / `.flash-red` | 150ms background flash for price changes |
| `.scrollbar-hide` | Hide scrollbar (mobile nav) |

---

## Interactive Patterns

### Hover States
- Row hover: `hover:bg-white/[0.03]` — barely visible tint
- Card border hover: `hover:border-white/10` (from `white/5`)
- Text hover (grouped): `group-hover:text-accent`
- Icon hover: `group-hover:text-accent transition-colors`

### Transitions
- Standard: `transition-colors duration-150 ease-out`
- Card-level: `transition-all duration-200 ease-out`

### Focus States
- `focus:outline-none focus:ring-2 focus:ring-accent/50`
- Applied to interactive list items with `tabIndex={0}`

### Cursors
- Data rows: `cursor-pointer`
- Drag handles: `cursor-grab` / `cursor-grabbing`

---

## Loading / Error / Empty States

### Loading
```tsx
// Skeleton rows matching final layout dimensions
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center justify-between py-1">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-2.5 w-14" />
    </div>
  ))}
</div>
```

### Error
```tsx
<div className="py-4 text-center">
  <p className="text-xs text-dash-red">Failed to load {thing}</p>
  <p className="text-[10px] text-dash-muted mt-1">{error}</p>
</div>
```

### Empty
```tsx
<div className="py-4 text-center">
  <p className="text-xs text-dash-muted">No {things} available</p>
  <p className="text-[10px] text-dash-muted/60 mt-1">Check back later</p>
</div>
```

---

## Icon Usage

### Library
All icons from `lucide-react`.

### Sizing
| Context | Classes |
|---------|---------|
| Section header | `w-4 h-4` |
| Trend arrows (quotes) | `w-3.5 h-3.5` |
| Timestamps, inline | `w-3 h-3` |

### Coloring
- Status: `text-dash-green` / `text-dash-red`
- Muted: `text-dash-muted` / `text-white/25` / `text-white/15`
- Hover: `group-hover:text-accent`

### Icon Containers (trend indicators)
```tsx
<div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-dash-green/15">
  <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
</div>
```

---

## Dashboard Home / Terminal Workspace Style

The Dashboard Home tab uses a **draggable widget grid** that mimics a Bloomberg Terminal layout:

### Core Principles
- **Full viewport**: `.terminal-workspace` fills `calc(100vh - 36px)` below the header
- **No rounded corners on panels**: `.terminal-panel` uses `border-radius: 0`
- **Tabular numbers**: `font-variant-numeric: tabular-nums` globally on workspace
- **Rigid borders**: `#2a2a2a` solid borders, no shadows, no glow
- **Focus = blue border**: `.terminal-panel.is-focused` → `border-color: rgba(26, 143, 255, 0.5)`

### Widget Panel Structure
```tsx
<div className="terminal-panel">
  <div className="terminal-panel-header">
    {/* Drag handle + title + controls */}
    <div className="widget-drag-handle cursor-grab">
      <GripVertical className="w-3 h-3" />
    </div>
    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
      WIDGET TITLE
    </span>
  </div>
  <div className="p-0">
    {/* Widget content — no internal padding on container */}
  </div>
</div>
```

### Widget vs Card Distinction
| Aspect | Widget (Dashboard Home) | Card (Markets/Research) |
|--------|------------------------|------------------------|
| Background | `#111111` solid | `rgba(17,17,17,0.95)` glass |
| Border | `#2a2a2a` solid | `rgba(255,255,255,0.06)` |
| Border radius | `0` (sharp corners) | `rounded-xl` (12px) |
| Interaction | Draggable, resizable | Static, scrollable |
| Header | Drag handle + controls | Title + count |

---

## Anti-Patterns Checklist

Before submitting any UI component, verify NONE of these exist:

- [ ] Card padding larger than `p-3` (or `p-4` for quote cards only)
- [ ] Row padding larger than `py-1.5`
- [ ] Font size `text-lg` or above on non-hero content
- [ ] `mb-4` or larger between header and content
- [ ] Large icons (`w-6`, `w-8`, etc.) — max is `w-4` inline
- [ ] Decorative illustrations, empty states with icons, or "no data" SVGs
- [ ] Rounded badge with `rounded-full` on data badges (use `rounded-md`)
- [ ] `gap-6`, `gap-8`, `space-y-4` between data rows
- [ ] Hardcoded colors instead of `dash-*` tokens
- [ ] Missing `font-mono` on any numeric value
- [ ] `text-white` instead of `text-dash-text` for primary text
- [ ] Box shadows on cards (only `.accent-glow` is allowed, sparingly)
- [ ] Gradients on backgrounds (flat colors only)
- [ ] Padding that creates visible "breathing room" — if you can see empty space, it's too much

---

## Reference Implementation Files

When building new components, copy patterns from these files:

| Pattern | Reference File |
|---------|---------------|
| Data card (list) | `components/markets/MarketDashboard/DividendsCard.tsx` |
| Data card (simple) | `components/markets/MarketDashboard/IposCard.tsx` |
| Quote display | `components/markets/KeyMarketsGrid.tsx` |
| News list | `components/markets/KeyNewsSection.tsx` |
| Page layout | `components/markets/MarketsTab.tsx` |
| Data table | `components/data/RecentDataTable.tsx` |
| Badge component | `components/ui/Badge.tsx` |
| Skeleton loading | `components/ui/Skeleton.tsx` |
