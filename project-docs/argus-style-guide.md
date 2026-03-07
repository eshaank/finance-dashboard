# Argus Design System — Style Guide

> The visual language for a conversational financial research terminal. This guide defines every design decision so any page, component, or feature built for Argus is visually consistent.

---

## 1. Design Philosophy

Argus is a **dark-mode-first financial tool** that balances information density with readability. The aesthetic is inspired by professional trading terminals but softened for a broader audience — think Bloomberg meets a modern design system.

**Core principles:**

- **Quiet confidence** — The interface stays out of the way. Dark surfaces, muted borders, and restrained color let the data speak. Color is reserved for meaning (accent, positive, negative), never decoration.
- **Layered depth** — Surfaces are distinguished by subtle background shade shifts rather than heavy borders or shadows. This creates hierarchy without visual noise.
- **Monospace for data, sans-serif for prose** — Financial numbers use a monospace face for scanability and alignment. Everything else uses a clean humanist sans-serif.
- **Soft geometry** — Rounded corners throughout (never sharp, never fully circular for containers). This keeps the terminal feel but avoids the coldness of hard edges.

---

## 2. Color System

### 2.1 Background Surfaces

The interface uses a layered surface system with four tiers. Each tier is a slightly lighter shade of near-black, creating depth without borders.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0a0b0e` | App background, widget canvas, deepest layer |
| `--bg-secondary` | `#111318` | Sidebar, chat panel, widget card backgrounds |
| `--bg-tertiary` | `#181b22` | Input fields, toggles, nested containers, icon backgrounds |
| `--bg-hover` | `#1e2230` | Hover state for interactive elements on any surface |

**Rule:** Each surface should be exactly one tier lighter than its parent. Never skip tiers (e.g., don't place `--bg-tertiary` directly on `--bg-primary` without a `--bg-secondary` container in between, unless it's a small element like a badge).

### 2.2 Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--border` | `#252a36` | Standard borders — buttons, inputs, table headers |
| `--border-subtle` | `#1c2028` | Structural dividers — panel edges, section separators |

**Rule:** Use `--border-subtle` for large structural divisions (panel edges, header underlines). Use `--border` for interactive element outlines (buttons, inputs, table cells). Borders are always `1px solid`. Never use borders thicker than 1px anywhere in the UI.

### 2.3 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#e8eaf0` | Headings, primary content, active labels, table first-column |
| `--text-secondary` | `#8b90a0` | Body text, descriptions, table data cells, chat message prose |
| `--text-muted` | `#555b6e` | Labels, metadata, timestamps, placeholders, section titles |

**Hierarchy rule:** Every text element must use exactly one of these three tiers. The decision tree:

- Is this the most important text in its container? → `--text-primary`
- Is this supporting content the user reads? → `--text-secondary`
- Is this a label, hint, or metadata? → `--text-muted`

### 2.4 Accent Color

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#5b8cff` | Primary interactive color — active states, links, focused borders, CTA buttons |
| `--accent-dim` | `#3d6ae0` | Hover state for accent-colored elements |
| `--accent-glow` | `rgba(91, 140, 255, 0.08)` | Subtle background tint for active/selected items |

The accent is a **medium-saturation blue** — bright enough to be noticed, muted enough to not overwhelm data. It is the only "brand" color in the interface.

**Usage rules:**

- Active navigation items: `--accent` text on `--accent-glow` background
- Focused inputs: `--accent` border color
- Primary buttons (e.g., send): solid `--accent` background with white text
- Inline metric highlights in chat: `--accent` text on `--accent-glow` background
- Never use accent as a large background fill (e.g., never fill a full panel with it)

### 2.5 Semantic Colors

| Token | Hex | Dim variant | Usage |
|-------|-----|-------------|-------|
| `--green` | `#34d399` | `rgba(52, 211, 153, 0.12)` | Positive change, upward trend, online status, success |
| `--red` | `#f87171` | `rgba(248, 113, 113, 0.12)` | Negative change, downward trend, errors, warnings |
| `--amber` | `#fbbf24` | — | Neutral alerts, caution states, pending |

**Positive/negative indicators** always use the semantic color for text and the dim variant as a background pill. Example: green text `▲ 6.1%` on `--green-dim` background, rounded into a small badge.

**Alpha variants with `color-mix()`:** Instead of hardcoding rgba values for dim variants, prefer:

```css
--green-dim: color-mix(in oklab, var(--green) 12%, transparent);
--red-dim: color-mix(in oklab, var(--red) 12%, transparent);
--accent-glow: color-mix(in oklab, var(--accent) 8%, transparent);
```

This keeps dim variants in sync when base colors change.

### 2.6 Chart Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--chart-1` | `#5b8cff` | Primary series (matches accent) |
| `--chart-2` | `#a78bfa` | Secondary series (soft purple) |
| `--chart-3` | `#34d399` | Tertiary series (matches green) |
| `--chart-4` | `#fbbf24` | Quaternary series (matches amber) |

Charts use these four colors in order. If more than four series are needed, reduce opacity of existing colors (e.g., `--chart-1` at 50% opacity) rather than introducing new hues. This keeps the palette tight and prevents visual chaos.

### 2.7 Logo Gradient

The Argus logo mark uses a diagonal gradient from the accent blue to the chart purple:

```
background: linear-gradient(135deg, #5b8cff, #a78bfa);
```

This gradient is used **only** for the logo. It should not appear anywhere else in the UI.

---

## 3. Typography

### 3.1 Font Stack

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Body / UI** | `DM Sans` | 400, 500, 600, 700 | All interface text, labels, buttons, chat messages |
| **Data / Numbers** | `JetBrains Mono` | 400, 500 | Financial figures, metrics, ticker badges, inline code |
| **Display / Titles** | `Fraunces` | 300, 600 | Canvas titles, empty states, hero text (serif warmth) |

**Fallback chain:** `'DM Sans', -apple-system, sans-serif` for body, `'JetBrains Mono', 'SF Mono', monospace` for data, `'Fraunces', Georgia, serif` for display.

### 3.2 Type Scale

| Element | Size | Weight | Family | Color | Extra |
|---------|------|--------|--------|-------|-------|
| Canvas title | 18px | 600 | Fraunces | `--text-primary` | — |
| Chat header title | 14px | 600 | DM Sans | `--text-primary` | — |
| Section title (uppercase) | 10–11px | 600 | DM Sans | `--text-muted` | `letter-spacing: 0.06–0.08em`, `text-transform: uppercase` |
| Body text / chat messages | 13.5px | 400 | DM Sans | `--text-secondary` | `line-height: 1.6` |
| Sidebar item name | 13px | 500 | DM Sans | `--text-primary` | Truncate with ellipsis |
| Sidebar item meta | 11px | 400 | DM Sans | `--text-muted` | — |
| Button label | 11–12px | 500 | DM Sans | `--text-secondary` | — |
| Table header | 11px | 600 | DM Sans | `--text-muted` | `letter-spacing: 0.04em`, `text-transform: uppercase` |
| Table data | 13px | 400 | DM Sans | `--text-secondary` | — |
| Metric value (large) | 20px | 500 | JetBrains Mono | `--text-primary` | — |
| Metric change badge | 11px | 500 | JetBrains Mono | Semantic color | — |
| Inline metric (chat) | 12px | 400 | JetBrains Mono | `--accent` | On `--accent-glow` background |
| Ticker badge | 10px | 600 | JetBrains Mono | `--text-secondary` | `letter-spacing: 0.02em` |
| Chart axis label | 10px | 400 | JetBrains Mono | `--text-muted` | — |
| Tool call name | 11px | 400 | JetBrains Mono | `--text-secondary` | — |
| Input placeholder | 13px | 400 | DM Sans | `--text-muted` | — |
| Footer text | 10px | 400 | DM Sans | `--text-muted` | — |

### 3.3 Typography Rules

- **All section/category labels** use uppercase with letter-spacing. This is the primary way to signal "this is a label, not content."
- **Bold (`font-weight: 600–700`)** is used sparingly — only for headings, key phrases in chat (wrapped in `<strong>`), and section titles. Never bold entire paragraphs.
- **Chat messages** use `--text-secondary` for prose and `--text-primary` for `<strong>` highlights. This creates a natural hierarchy within a single message.
- **Numbers in data contexts** (tables, metrics, charts) always use JetBrains Mono. Numbers in prose (chat messages) use DM Sans unless they are called out as inline metrics.
- **Line height** for body text is `1.6`. For labels and small text, use `1.2–1.3`. For large metric values, `1.0`.

---

## 4. Spacing & Layout

### 4.1 Grid System

The app uses a four-column CSS grid:

```
grid-template-columns: 56px 280px 1fr 420px;
```

| Column | Width | Content |
|--------|-------|---------|
| Icon rail | 56px fixed | Navigation icons, logo |
| Sidebar | 280px fixed | Templates, history, search |
| Widget canvas | Flexible (`1fr`) | Data visualizations, charts, tables |
| Chat panel | 420px fixed | Conversation, input, suggestions |

The layout is **full-viewport height** (`100vh`) with no outer scroll. Each column manages its own internal scrolling.

### 4.2 Spacing Scale

All spacing uses a **4px base unit**. Common values:

| Value | Pixels | Usage |
|-------|--------|-------|
| `xs` | 4px | Gap between tightly related elements (icon + label, badge padding) |
| `sm` | 8px | Inner padding for small components, gaps in compact lists |
| `md` | 12px | Standard padding for inputs, list items, button padding |
| `lg` | 16px | Panel padding, gap between widgets, section spacing |
| `xl` | 20px | Chat message area padding, chat input area padding |
| `2xl` | 24px | Canvas padding, content header padding |

### 4.3 Panel Padding

| Panel | Padding |
|-------|---------|
| Icon rail | `16px 0` (vertical only) |
| Sidebar header | `20px 16px 12px` |
| Sidebar sections | `0 8px` |
| Content header | `16px 24px` |
| Widget canvas | `24px` all sides |
| Chat messages area | `20px` all sides |
| Chat input area | `16px 20px` |

### 4.4 Widget Grid

The widget canvas uses a **2-column sub-grid** with `16px` gap:

```
grid-template-columns: 1fr 1fr;
grid-auto-rows: min-content;
gap: 16px;
```

Widgets can span the full width using a `.wide` class (`grid-column: 1 / -1`). Use full-width for data tables and key metric cards. Use half-width for charts and focused visualizations.

---

## 5. Shape & Radius

### 5.1 Border Radius Scale

| Size | Radius | Usage |
|------|--------|-------|
| `sharp` | 0px | Never used — Argus has no sharp corners |
| `xs` | 2–3px | Chart bar tops, legend dots |
| `sm` | 4px | Badges, change indicators, period toggle buttons, small pills |
| `md` | 6px | Icon backgrounds, small action buttons, sidebar action buttons |
| `lg` | 8px | Input fields, sidebar items, rail buttons, navigation icons, logo |
| `xl` | 10–12px | Widget cards, chat input wrapper, chat inline widgets |
| `pill` | 20px | Suggestion chips, tags |
| `circle` | 50% | Status indicator dot (chat online status) |

**Rule:** Container radius should always be larger than or equal to the radius of elements inside it. A widget card (`12px`) contains period toggles (`4px`) — the outer shape is always softer than the inner.

### 5.2 Shape Language

- **Rectangles with rounded corners** are the only shape primitive. No circles for containers, no sharp rectangles, no irregular shapes.
- **The logo** is the only element with a gradient fill. Everything else is flat color.
- **Icon containers** are always square with `border-radius: 6–8px`, never circular.
- **Chart bars** have rounded tops (`3px`) and flat bottoms (they sit on the axis).

---

## 6. Iconography

### 6.1 Style

All icons are **stroke-based SVGs** with the following properties:

| Property | Value |
|----------|-------|
| Stroke width | `1.8` (standard) or `2.0` (inside small containers) |
| Fill | `none` (always — never filled icons) |
| Line cap | `round` |
| Line join | `round` |
| Viewbox | `0 0 24 24` |

### 6.2 Icon Sizes

| Context | SVG Size | Container |
|---------|----------|-----------|
| Icon rail | 18×18px | 36×36px button |
| Sidebar item icon | 13–14px | 28×28px container |
| Inline (buttons, tool calls) | 14px | No container |
| Tool call indicator | 10×10px | 20×20px container |

### 6.3 Icon Colors

- **Default state:** `--text-muted`
- **Hover state:** `--text-secondary`
- **Active state:** `--accent`
- **Inside accent container:** `--accent` icon on `--accent-glow` background

---

## 7. Components

### 7.1 Buttons

**Ghost button (sidebar action, content buttons):**

```
background: none | var(--bg-tertiary)
border: 1px solid var(--border)
border-radius: 6–8px
color: var(--text-secondary)
font-size: 11–12px
padding: 4–6px 10–14px
```

Hover: border shifts to `--accent` or `--text-muted`, text shifts to `--accent` or `--text-primary`.

**Component API (CVA):** Codify button variants with [class-variance-authority](https://cva.style/docs) for type-safe props:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[--accent] text-white hover:bg-[--accent-dim]',
        ghost: 'border border-[--border] text-[--text-secondary] hover:border-[--accent] hover:text-[--accent]',
        chip: 'bg-[--bg-tertiary] border border-[--border] rounded-[20px] text-[--text-secondary] hover:border-[--accent] hover:text-[--accent] hover:bg-[--accent-glow]',
      },
      size: {
        sm: 'h-7 px-2.5 text-[11px]',
        md: 'h-9 px-3.5 text-[12px]',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  }
)
```

**Primary button (chat send):**

```
background: var(--accent)
border: none
border-radius: 8px
color: white
width/height: 36px square
```

Hover: background shifts to `--accent-dim`.

**Toggle button group (period selector, mode toggle):**

```
Container: background var(--bg-tertiary), border-radius 6px, padding 2px
Button: padding 3–4px 8–10px, border-radius 4px
Active: background var(--bg-hover) [period] or var(--accent) [mode], text var(--text-primary) or white
Inactive: transparent background, var(--text-muted) text
```

**Suggestion chip:**

```
background: var(--bg-tertiary)
border: 1px solid var(--border)
border-radius: 20px (pill)
color: var(--text-secondary)
font-size: 12px
padding: 5px 12px
```

Hover: border `--accent`, text `--accent`, background `--accent-glow`.

### 7.2 Input Fields

```
background: var(--bg-tertiary)
border: 1px solid var(--border) | var(--border-subtle)
border-radius: 8px (standalone) | 12px (chat input wrapper)
padding: 8–10px 12px
color: var(--text-primary)
font-size: 13–13.5px
placeholder: var(--text-muted)
```

Focus state: border transitions to `--accent` over `0.15s`.

**Error state:**

```
border-color: var(--red)
focus border-color: var(--red) (not accent)
```

Below the input, an error message element:

```
font-size: 11px
color: var(--red)
margin-top: 4px
role="alert"
```

The input must have `aria-invalid="true"` and `aria-describedby="<id>-error"` when in error state.

The chat input uses a wrapper pattern: the outer wrapper has the border and radius, containing a borderless textarea and a send button side by side.

### 7.3 Widget Cards

```
background: var(--bg-secondary)
border: 1px solid var(--border-subtle)
border-radius: 12px
padding: 20px
```

Hover: border transitions to `--border` (slightly more visible). No shadow — depth is communicated through surface color, not elevation.

Every widget card has a header row with a label (uppercase, `--text-muted`) on the left and optional controls (period toggle) on the right. Below the header is the data area (chart, table, metrics).

### 7.4 Data Tables

```
width: 100%
border-collapse: collapse
font-size: 13px
```

Header cells: `11px` uppercase, `--text-muted`, `1px solid var(--border)` bottom, padding `8px 12px`.

Data cells: `--text-secondary`, `1px solid var(--border-subtle)` bottom, padding `10px 12px`. Last row has no bottom border.

First column is `--text-primary` at `font-weight: 500`. Numeric columns are right-aligned and use JetBrains Mono.

### 7.5 Metric Cards

A metric is a vertical stack: label → value → change badge.

- **Label:** 11px, `--text-muted`, `font-weight: 500`
- **Value:** 20px, `--text-primary`, JetBrains Mono, `font-weight: 500`
- **Change badge:** 11px, JetBrains Mono, semantic color text on dim background, `border-radius: 4px`, padding `1px 6px`, includes arrow character (`▲` or `▼`)

Metrics are arranged in a 4-column grid with `16px` gap.

### 7.6 Tool Call Indicator

A horizontal row showing which API endpoint the LLM called:

```
background: var(--bg-tertiary)
border: 1px solid var(--border-subtle)
border-radius: 8px
padding: 8px 12px
```

Contains: icon container (20px, `--accent-glow` bg, `--accent` icon) → tool name (JetBrains Mono, 11px) → parameter hint (11px, `--text-muted`) → status checkmark (10px, `--green`, right-aligned).

### 7.7 Chat Messages

**User message:** sender label ("YOU") in uppercase `--text-muted`, bubble text in `--text-secondary` at 13.5px.

**AI message:** sender label ("ARGUS") in uppercase `--accent`, then optional tool call indicators, then bubble text in `--text-secondary` with `<strong>` sections in `--text-primary`, then optional suggestion chips.

Messages animate in with a `0.3s ease-out` slide-up: `translateY(8px)` → `translateY(0)` with opacity `0` → `1`.

### 7.8 Inline Metrics (Chat)

When the AI references a specific number in its prose, it's highlighted as an inline metric:

```
font-family: JetBrains Mono
font-size: 12px
color: var(--accent)
background: var(--accent-glow)
padding: 1px 6px
border-radius: 4px
```

For positive-change metrics, use `--green` text on `--green-dim` background instead.

### 7.9 Sidebar Items

```
padding: 8px 10px
border-radius: 8px
gap: 10px (between icon and text)
```

Contains: icon container (28px square, `border-radius: 6px`) → text block (name at 13px/500, meta at 11px/`--text-muted`).

Template icons use `--accent-glow` background + `--accent` icon color.
History icons use `--bg-tertiary` background + `--text-muted` icon color.

Active state: `--accent-glow` background on the entire row.
Hover state: `--bg-hover` background.

### 7.10 Status Indicator

The chat online dot:

```
width: 8px
height: 8px
border-radius: 50%
background: var(--green)
box-shadow: 0 0 8px rgba(52, 211, 153, 0.4)
```

The glow shadow is the only place in the UI where `box-shadow` is used for a visual effect.

---

## 8. Motion & Transitions

### 8.1 Timing

| Duration | Usage |
|----------|-------|
| `0.12s` | Micro-interactions — sidebar item hover, toggle switch |
| `0.15s` | Standard transitions — border color, text color, background |
| `0.2s` | Widget hover border |
| `0.3s` | Message entrance animation |

All transitions use `ease` or `ease-out` timing function. Never use `linear` (feels mechanical) or `ease-in` (feels sluggish at the start).

### 8.2 Transition Properties

- **Background color changes:** `transition: background 0.12s`
- **Border color changes:** `transition: border-color 0.15s`
- **Multi-property:** `transition: all 0.15s` (use sparingly — prefer targeting specific properties)
- **Chat messages:** `animation: messageIn 0.3s ease-out` (translateY + opacity)

### 8.3 Animation Rules

- No animation on initial page load (avoid entrance animations for static layout elements)
- Chat messages animate in when they appear in the stream
- Widgets do **not** animate in — they appear instantly when data is ready
- Hover effects are instant-feeling (`0.12–0.15s`) — the user should never feel like they're "waiting" for a hover
- Never use bounce, elastic, or spring animations — the tone is professional and restrained

### 8.4 Entry Animations (CSS-native)

For popover/dropdown entry animations, use the CSS `@starting-style` rule instead of JS-triggered class toggling:

```css
[popover] {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out, display 0.2s allow-discrete;
  opacity: 1;
  transform: scale(1);
}

[popover]:not(:popover-open) {
  opacity: 0;
  transform: scale(0.97);
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.97);
  }
}
```

This replaces JS animation libraries for entry/exit transitions on native popovers and dialogs.

---

## 9. Scrolling

### 9.1 Scrollbar Style

Custom scrollbars for all scrollable containers:

```
::-webkit-scrollbar { width: 5–6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
```

Scrollbars are thin and unobtrusive. They use the border color so they blend into the interface. No scrollbar on the icon rail (it shouldn't scroll). Sidebar, widget canvas, and chat messages each scroll independently.

### 9.2 Scroll Behavior

- The app shell is `overflow: hidden` — no page-level scroll
- Each panel manages its own scroll: `overflow-y: auto`
- Widget canvas uses `align-content: start` so widgets stack from the top
- Chat messages use `flex-direction: column` with `gap: 16px` between messages

---

## 10. Charts & Data Visualization

### 10.1 Bar Charts

- Bars use the chart palette colors in order
- Bar tops are rounded (`border-radius: 3px 3px 0 0`), bottoms are flat
- Bars within a group have `3px` gap
- Groups have `1px` gap between them
- X-axis labels sit below each group: 10px JetBrains Mono, `--text-muted`
- Hover: bar opacity reduces to `0.8`
- Chart legend sits below the chart with `14px` top margin

### 10.2 Line Charts

- Rendered as SVG `<polyline>` elements
- Stroke width: `2px`, `stroke-linecap: round`, `stroke-linejoin: round`
- Area fill beneath lines uses a vertical linear gradient from the line color at 10–15% opacity to transparent
- Grid lines: `0.5px` stroke in `--border-subtle`
- End-of-line dots: `3px` radius circles filled with the line color
- No axis labels on the chart itself — context is provided by the widget header and legend

### 10.3 Legend

```
display: flex
gap: 16px
margin-top: 14px
```

Each item: colored dot (8px square, `border-radius: 2px`) + label (12px, `--text-secondary`). Legend can optionally include the current value next to the label.

### 10.4 Chart Interaction Patterns

- **Hover:** Tooltip with exact value (not yet implemented in POC, but the pattern is: a floating div positioned near the cursor with `--bg-tertiary` background, `--border` border, `border-radius: 8px`)
- **Period toggle:** Changes the data range; the toggle sits in the widget header
- **Drill-down:** Clicking a bar or data point could open a deeper view (future feature)

---

## 11. Responsive Considerations

The current design targets desktop (1280px+ width). For future responsive breakpoints:

| Breakpoint | Behavior |
|------------|----------|
| < 1280px | Sidebar collapses to icon-only (same as rail); canvas becomes full-width |
| < 1024px | Chat panel becomes an overlay/drawer triggered by a button |
| < 768px | Single-column layout — chat is primary, widgets stack below |

The widget canvas grid should also respond: 2 columns above 900px canvas width, 1 column below.

---

## 12. Do's and Don'ts

### Do

- Use the surface layering system consistently — every element sits on a surface one tier lighter than its parent
- Use JetBrains Mono for any number the user might want to scan or compare
- Use uppercase + letter-spacing for all section labels and category headers
- Keep borders at 1px and use the subtle variant for structural dividers
- Use semantic colors (green/red) only for data that has directional meaning
- Animate chat messages in; keep everything else instant
- Use `--accent-glow` as the universal "this is selected/active" background

### Don't

- Don't use shadows for elevation — use surface color tiers instead
- Don't introduce new colors outside the defined palette
- Don't use the accent color for large background fills
- Don't use the logo gradient on anything other than the logo
- Don't use filled icons — all icons are stroke-only
- Don't use borders thicker than 1px
- Don't use bounce/spring/elastic animations
- Don't use fully circular containers (except the 8px status dot)
- Don't mix font families within a single data context (e.g., don't put a DM Sans number next to a JetBrains Mono number in the same table)

---

## 13. Accessibility

### 13.1 Focus Rings

All interactive elements (buttons, inputs, links, sidebar items) must have visible focus indicators using the `focus-visible` pseudo-class:

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[--accent]
focus-visible:ring-offset-2
focus-visible:ring-offset-[--bg-secondary]
```

The ring uses `--accent` to match the brand color. The offset uses the parent surface color so the ring doesn't touch the element edge.

### 13.2 ARIA for Form Errors

Inputs in error state must include:

- `aria-invalid="true"` on the input element
- `aria-describedby="<id>-error"` pointing to the error message element
- The error message element must have `role="alert"` so screen readers announce it

```html
<input id="ticker" aria-invalid="true" aria-describedby="ticker-error" />
<p id="ticker-error" role="alert">Ticker symbol not found</p>
```

### 13.3 Screen Reader Text

Icon-only buttons (send, sidebar collapse, widget actions) must include a visually hidden label:

```html
<button>
  <SendIcon />
  <span class="sr-only">Send message</span>
</button>
```

The `sr-only` class: `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;`

### 13.4 Keyboard Navigation

- **Sidebar items and toggle groups** must be navigable with arrow keys (`role="listbox"` or `role="tablist"` as appropriate)
- **Escape** closes any open popover, dropdown, or overlay
- **Enter/Space** activates buttons and toggles
- **Tab order** follows visual layout: icon rail → sidebar → canvas → chat panel

### 13.5 Color Contrast

All text/background combinations meet WCAG AA (4.5:1 minimum):

| Combination | Ratio | Pass |
|-------------|-------|------|
| `--text-primary` (#e8eaf0) on `--bg-primary` (#0a0b0e) | ~14:1 | AA |
| `--text-primary` (#e8eaf0) on `--bg-secondary` (#111318) | ~12:1 | AA |
| `--text-secondary` (#8b90a0) on `--bg-secondary` (#111318) | ~5:1 | AA |
| `--text-muted` (#555b6e) on `--bg-secondary` (#111318) | ~2.8:1 | AA Large only |

**Note:** `--text-muted` on dark surfaces passes AA only for large text (14px bold / 18px regular). Since muted text is used at 10–11px for labels, ensure these labels are `font-weight: 600` to improve legibility.