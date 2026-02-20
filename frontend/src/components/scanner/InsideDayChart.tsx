import type { OHLCBar } from '../../types'

const COLOR_MOTHER = '#d29922'
const COLOR_INSIDE = '#3fb950'
const COLOR_REGULAR = 'rgba(255,255,255,0.25)'

const VIEW_W = 560
const VIEW_H = 160
const PAD_X = 6
const PAD_TOP = 10
const PAD_BOT = 18

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

  const chartW = VIEW_W - PAD_X * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOT
  const barSlotW = chartW / bars.length
  const bodyW = Math.max(1, barSlotW * 0.6)

  function toY(price: number) {
    return PAD_TOP + chartH - ((price - globalLow) / priceRange) * chartH
  }

  function barColor(date: string) {
    if (date === motherBarDate) return COLOR_MOTHER
    if (insideDayDates.includes(date)) return COLOR_INSIDE
    return COLOR_REGULAR
  }

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
      {/* Grid lines */}
      {gridPrices.map((p) => (
        <line
          key={p}
          x1={PAD_X}
          x2={VIEW_W - PAD_X}
          y1={toY(p)}
          y2={toY(p)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Candles */}
      {bars.map((bar, i) => {
        const color = barColor(bar.date)
        const cx = PAD_X + i * barSlotW + barSlotW / 2
        const bodyTop = toY(Math.max(bar.open, bar.close))
        const bodyBot = toY(Math.min(bar.open, bar.close))
        const bodyHeight = Math.max(1, bodyBot - bodyTop)
        const isMother = bar.date === motherBarDate

        return (
          <g key={bar.date}>
            {/* Wick */}
            <line
              x1={cx}
              x2={cx}
              y1={toY(bar.high)}
              y2={toY(bar.low)}
              stroke={color}
              strokeWidth={isMother ? 1.5 : 1}
            />
            {/* Body */}
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

      {/* Date label — last bar only */}
      <text
        x={VIEW_W - PAD_X}
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
