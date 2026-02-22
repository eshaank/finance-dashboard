import type { OHLCBar } from '../../types'

// Regular bars — solid but slightly dimmed so special bars still pop
const COLOR_BULL = 'rgba(63,185,80,0.55)'
const COLOR_BEAR = 'rgba(220,80,80,0.55)'

// Special bars — full-brightness versions of the same green/red
const COLOR_BULL_BRIGHT = '#3fb950'
const COLOR_BEAR_BRIGHT = '#e05252'

// Vertical strip tints behind special bars
const STRIP_INSIDE = 'rgba(255,255,255,0.04)'
const STRIP_MOTHER = 'rgba(255,255,255,0.06)'

const VIEW_W = 560
const VIEW_H = 160
const PAD_X = 6
const PAD_TOP = 10
const PAD_BOT = 18
const LABEL_W = 44

interface Props {
  bars: OHLCBar[]
  motherBarDate: string | null
  insideDayDates: string[]
}

export function InsideDayChart({ bars, motherBarDate, insideDayDates }: Props) {
  if (bars.length === 0) return null

  const globalHigh = Math.max(...bars.map((b) => b.high))
  const globalLow = Math.min(...bars.map((b) => b.low))
  const priceRange = globalHigh - globalLow || 1

  const chartW = VIEW_W - PAD_X - LABEL_W
  const chartH = VIEW_H - PAD_TOP - PAD_BOT
  const barSlotW = chartW / bars.length
  const bodyW = Math.max(1, barSlotW * 0.6)

  function toY(price: number) {
    return PAD_TOP + chartH - ((price - globalLow) / priceRange) * chartH
  }

  function isMother(date: string) { return date === motherBarDate }
  function isInside(date: string) { return insideDayDates.includes(date) }

  const gridPrices = [
    globalLow + priceRange * 0.25,
    globalLow + priceRange * 0.5,
    globalLow + priceRange * 0.75,
  ]

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full"
      aria-label="Candlestick chart"
    >
      <defs>
        {/* Mother glow — two passes for a stronger halo */}
        <filter id="glowMotherBull" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={COLOR_BULL_BRIGHT} floodOpacity="0.90" />
        </filter>
        <filter id="glowMotherBear" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={COLOR_BEAR_BRIGHT} floodOpacity="0.90" />
        </filter>
        {/* Inside day glow */}
        <filter id="glowInsideBull" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={COLOR_BULL_BRIGHT} floodOpacity="0.75" />
        </filter>
        <filter id="glowInsideBear" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={COLOR_BEAR_BRIGHT} floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Vertical highlight strips behind special bars */}
      {bars.map((bar, i) => {
        const mother = isMother(bar.date)
        const inside = isInside(bar.date)
        if (!mother && !inside) return null
        return (
          <rect
            key={`strip-${bar.date}`}
            x={PAD_X + i * barSlotW}
            y={PAD_TOP}
            width={barSlotW}
            height={chartH}
            fill={mother ? STRIP_MOTHER : STRIP_INSIDE}
          />
        )
      })}

      {/* Grid lines with price labels */}
      {gridPrices.map((p) => (
        <g key={p}>
          <line
            x1={PAD_X}
            x2={VIEW_W - LABEL_W}
            y1={toY(p)}
            y2={toY(p)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={VIEW_W - LABEL_W + 4}
            y={toY(p) + 3}
            textAnchor="start"
            fontSize={8}
            fill="rgba(255,255,255,0.22)"
            fontFamily="monospace"
          >
            ${p.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Candles */}
      {bars.map((bar, i) => {
        const mother = isMother(bar.date)
        const inside = isInside(bar.date)
        const special = mother || inside
        const bullish = bar.close >= bar.open

        const cx = PAD_X + i * barSlotW + barSlotW / 2
        const bodyTop = toY(Math.max(bar.open, bar.close))
        const bodyBot = toY(Math.min(bar.open, bar.close))
        const bodyHeight = Math.max(1, bodyBot - bodyTop)

        // Special bars use full-brightness color; regular bars are dimmed
        const color = special
          ? bullish ? COLOR_BULL_BRIGHT : COLOR_BEAR_BRIGHT
          : bullish ? COLOR_BULL : COLOR_BEAR

        // Glow filter is keyed on both role and direction
        const filter = mother
          ? bullish ? 'url(#glowMotherBull)' : 'url(#glowMotherBear)'
          : inside
          ? bullish ? 'url(#glowInsideBull)' : 'url(#glowInsideBear)'
          : undefined

        const wickW = special ? 1.5 : 1

        return (
          <g key={bar.date} filter={filter}>
            {/* Upper wick — only the part above the body */}
            {toY(bar.high) < bodyTop && (
              <line
                x1={cx} x2={cx}
                y1={toY(bar.high)} y2={bodyTop}
                stroke={color}
                strokeWidth={wickW}
              />
            )}
            {/* Lower wick — only the part below the body */}
            {toY(bar.low) > bodyBot && (
              <line
                x1={cx} x2={cx}
                y1={bodyBot} y2={toY(bar.low)}
                stroke={color}
                strokeWidth={wickW}
              />
            )}
            {/* Solid body */}
            <rect
              x={cx - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyHeight}
              fill={color}
            />
          </g>
        )
      })}

      {/* Date label — last bar */}
      <text
        x={VIEW_W - LABEL_W}
        y={VIEW_H - 4}
        textAnchor="end"
        fontSize={9}
        fill="rgba(255,255,255,0.25)"
        fontFamily="monospace"
      >
        {bars[bars.length - 1].date}
      </text>
    </svg>
  )
}
