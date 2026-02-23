import { useRef, useEffect, useState } from 'react'
import type { OHLCBar } from '../../types'

// Theme colors from tailwind config
const COLOR_BULL = '#3fb950'      // dash-green
const COLOR_BEAR = '#f85149'      // dash-red
const COLOR_BULL_DIM = 'rgba(63,185,80,0.45)'
const COLOR_BEAR_DIM = 'rgba(248,81,73,0.45)'

// Vertical strip tints behind special bars
const STRIP_INSIDE = 'rgba(63,185,80,0.06)'
const STRIP_MOTHER = 'rgba(210,153,34,0.08)'

const MIN_WIDTH = 400
const MIN_HEIGHT = 200
const PAD_X = 8
const PAD_TOP = 12
const PAD_BOT = 24
const LABEL_W = 52

interface Props {
  bars: OHLCBar[]
  motherBarDate: string | null
  insideDayDates: string[]
}

export function InsideDayChart({ bars, motherBarDate, insideDayDates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: MIN_WIDTH, height: MIN_HEIGHT })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(MIN_WIDTH, width),
          height: Math.max(MIN_HEIGHT, height)
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  if (bars.length === 0) return null

  const { width: VIEW_W, height: VIEW_H } = dimensions

  const globalHigh = Math.max(...bars.map((b) => b.high))
  const globalLow = Math.min(...bars.map((b) => b.low))
  const priceRange = globalHigh - globalLow || 1

  const chartW = VIEW_W - PAD_X - LABEL_W
  const chartH = VIEW_H - PAD_TOP - PAD_BOT
  const barSlotW = chartW / bars.length
  const bodyW = Math.max(2, Math.min(barSlotW * 0.7, 12))

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

  // Generate unique filter IDs for multiple chart instances
  const filterId = `chart-${Math.random().toString(36).slice(2, 8)}`

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Candlestick chart showing inside day patterns"
      >
        <defs>
          {/* Mother bar glow - strong halo with direction color */}
          <filter id={`glow-mother-bull-${filterId}`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={COLOR_BULL} floodOpacity="0.85" />
          </filter>
          <filter id={`glow-mother-bear-${filterId}`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={COLOR_BEAR} floodOpacity="0.85" />
          </filter>
          {/* Inside day glow */}
          <filter id={`glow-inside-bull-${filterId}`} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={COLOR_BULL} floodOpacity="0.7" />
          </filter>
          <filter id={`glow-inside-bear-${filterId}`} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={COLOR_BEAR} floodOpacity="0.7" />
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

        {/* Grid lines */}
        {gridPrices.map((p) => (
          <g key={p}>
            <line
              x1={PAD_X}
              x2={VIEW_W - LABEL_W}
              y1={toY(p)}
              y2={toY(p)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={VIEW_W - LABEL_W + 6}
              y={toY(p) + 3}
              textAnchor="start"
              fontSize={10}
              fill="rgba(139,148,158,0.6)"
              fontFamily="Geist Mono, JetBrains Mono, monospace"
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
          const bodyHeight = Math.max(2, bodyBot - bodyTop)

          // Color logic: special bars get bright green/red based on direction, regular bars dimmed
          let color: string
          let filter: string | undefined
          if (mother) {
            color = bullish ? COLOR_BULL : COLOR_BEAR
            filter = bullish 
              ? `url(#glow-mother-bull-${filterId})` 
              : `url(#glow-mother-bear-${filterId})`
          } else if (inside) {
            color = bullish ? COLOR_BULL : COLOR_BEAR
            filter = bullish 
              ? `url(#glow-inside-bull-${filterId})` 
              : `url(#glow-inside-bear-${filterId})`
          } else {
            color = bullish ? COLOR_BULL_DIM : COLOR_BEAR_DIM
          }

          const wickW = special ? 2 : 1

          return (
            <g key={bar.date} filter={filter}>
              {/* Upper wick */}
              {toY(bar.high) < bodyTop && (
                <line
                  x1={cx} x2={cx}
                  y1={toY(bar.high)} y2={bodyTop}
                  stroke={color}
                  strokeWidth={wickW}
                  strokeLinecap="round"
                />
              )}
              {/* Lower wick */}
              {toY(bar.low) > bodyBot && (
                <line
                  x1={cx} x2={cx}
                  y1={bodyBot} y2={toY(bar.low)}
                  stroke={color}
                  strokeWidth={wickW}
                  strokeLinecap="round"
                />
              )}
              {/* Body */}
              <rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyHeight}
                fill={color}
                rx={special ? 1 : 0}
              />
            </g>
          )
        })}

        {/* Date labels */}
        <text
          x={PAD_X + barSlotW / 2}
          y={VIEW_H - 6}
          textAnchor="start"
          fontSize={9}
          fill="rgba(139,148,158,0.5)"
          fontFamily="Geist Mono, JetBrains Mono, monospace"
        >
          {bars[0].date}
        </text>
        <text
          x={VIEW_W - LABEL_W}
          y={VIEW_H - 6}
          textAnchor="end"
          fontSize={9}
          fill="rgba(139,148,158,0.5)"
          fontFamily="Geist Mono, JetBrains Mono, monospace"
        >
          {bars[bars.length - 1].date}
        </text>
      </svg>
    </div>
  )
}
