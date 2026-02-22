import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChartTimeframe, OHLCBar } from '../../types'
import { cn } from '../../lib/utils'

const TIMEFRAMES: ChartTimeframe[] = ['1D', '1W', '1M', '6M', '12M', '5Y', 'Max']

const DEFAULT_VIEW_W = 700
const VIEW_H = 260
const PAD_X = 52
const PAD_X_SM = 36
const PAD_TOP = 40
const PAD_BOT = 28

function useContainerWidth(defaultWidth: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(defaultWidth)

  const updateWidth = useCallback(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth || defaultWidth)
    }
  }, [defaultWidth])

  useEffect(() => {
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [updateWidth])

  return { ref, width }
}

interface Props {
  ticker: string
  bars: OHLCBar[]
  latestClose?: number
  loading: boolean
  timeframe?: ChartTimeframe
  onTimeframeChange?: (tf: ChartTimeframe) => void
}

function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

export function PriceChart({ ticker, bars, latestClose, loading, timeframe, onTimeframeChange }: Props) {
  const { ref: containerRef, width: containerWidth } = useContainerWidth(DEFAULT_VIEW_W)
  const VIEW_W = Math.max(containerWidth, 300)
  const padX = VIEW_W < 500 ? PAD_X_SM : PAD_X
  const chartW = VIEW_W - padX * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOT

  if (loading) {
    return (
      <div ref={containerRef}>
        <div className="mb-3">
          <span className="text-xs uppercase tracking-widest text-white/50">{ticker}</span>
        </div>
        <div
          className="w-full rounded animate-pulse bg-white/[0.04]"
          style={{ height: VIEW_H }}
        />
      </div>
    )
  }

  if (bars.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm">
        No price data available
      </div>
    )
  }

  const closes = bars.map((b) => b.close)
  const minVal = Math.min(...closes)
  const maxVal = Math.max(...closes)
  const range = maxVal - minVal || 1

  function toX(i: number) {
    return padX + (i / (bars.length - 1)) * chartW
  }
  function toY(v: number) {
    return PAD_TOP + chartH - ((v - minVal) / range) * chartH
  }

  const linePts = bars
    .map((b, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(b.close).toFixed(1)}`)
    .join(' ')

  const areaD =
    linePts +
    ` L${toX(bars.length - 1).toFixed(1)},${(PAD_TOP + chartH).toFixed(1)}` +
    ` L${toX(0).toFixed(1)},${(PAD_TOP + chartH).toFixed(1)} Z`

  const gridValues = [
    minVal + range * 0.25,
    minVal + range * 0.5,
    minVal + range * 0.75,
  ]

  const lastClose = bars[bars.length - 1].close
  const prevClose = bars[bars.length - 2].close
  const displayClose = latestClose ?? lastClose
  const change = displayClose - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0
  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-emerald-400' : 'text-rose-400'
  const changeSign = isPositive ? '+' : ''

  const lineColor = isPositive ? '#10b981' : '#f43f5e'
  const gradientId = `price-grad-${ticker}`

  // Last data point coordinates for end dot
  const lastX = toX(bars.length - 1)
  const lastY = toY(lastClose)

  return (
    <div ref={containerRef}>
      <div className="mb-2">
        <span className="text-xs uppercase tracking-widest text-white/50 block mb-0.5">{ticker}</span>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-display font-semibold text-white">
            {fmtPrice(displayClose)}
          </span>
          <span className={`text-sm font-mono ${changeColor}`}>
            {changeSign}{change.toFixed(2)} ({changeSign}{changePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {onTimeframeChange && (
        <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06] mb-3 w-fit">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors rounded-md',
                timeframe === tf
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60',
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        aria-label={`${ticker} price chart`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.20} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines — dashed */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={padX}
              x2={VIEW_W - padX}
              y1={toY(v)}
              y2={toY(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={VIEW_W - padX + 4}
              y={toY(v) + 4}
              textAnchor="start"
              fontSize={9}
              fill="rgba(255,255,255,0.25)"
              fontFamily="monospace"
            >
              {fmtPrice(v)}
            </text>
          </g>
        ))}

        {/* Baseline (x-axis) */}
        <line
          x1={padX}
          x2={VIEW_W - padX}
          y1={PAD_TOP + chartH}
          y2={PAD_TOP + chartH}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={linePts}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* End dot */}
        <circle
          cx={lastX}
          cy={lastY}
          r={3}
          fill={lineColor}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={1}
        />

        {/* X-axis date labels */}
        <text
          x={padX}
          y={VIEW_H - 4}
          textAnchor="start"
          fontSize={9}
          fill="rgba(255,255,255,0.25)"
          fontFamily="monospace"
        >
          {bars[0].date}
        </text>
        <text
          x={VIEW_W - padX}
          y={VIEW_H - 4}
          textAnchor="end"
          fontSize={9}
          fill="rgba(255,255,255,0.25)"
          fontFamily="monospace"
        >
          {bars[bars.length - 1].date}
        </text>
      </svg>
    </div>
  )
}
