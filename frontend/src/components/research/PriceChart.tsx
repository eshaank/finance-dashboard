import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChartTimeframe, OHLCBar } from '../../types'
import { cn } from '../../lib/utils'
import { LineChart, BarChart3 } from 'lucide-react'

const TIMEFRAMES: ChartTimeframe[] = ['1D', '1W', '1M', '6M', '12M', '5Y', 'Max']

const DEFAULT_VIEW_W = 700
const VIEW_H = 260
const PAD_X = 52
const PAD_X_SM = 36
const PAD_TOP = 40
const PAD_BOT = 28

export type ChartType = 'line' | 'candle'

export interface ChartEvent {
  date: string
  type: 'dividend' | 'reverse-split' | 'split'
  value: string
  description: string
}

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
  chartType?: ChartType
  onChartTypeChange?: (type: ChartType) => void
  events?: ChartEvent[]
  lineColor?: string
  hideHeader?: boolean
  hideTimeframes?: boolean
  hideChartToggle?: boolean
}

function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

export function PriceChart({
  ticker,
  bars,
  latestClose,
  loading,
  timeframe,
  onTimeframeChange,
  chartType = 'line',
  onChartTypeChange,
  events,
  lineColor: lineColorProp,
  hideHeader,
  hideTimeframes,
  hideChartToggle,
}: Props) {
  const { ref: containerRef, width: containerWidth } = useContainerWidth(DEFAULT_VIEW_W)
  const VIEW_W = Math.max(containerWidth, 300)
  const padX = VIEW_W < 500 ? PAD_X_SM : PAD_X
  const chartW = VIEW_W - padX * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOT

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (loading) {
    return (
      <div ref={containerRef}>
        {!hideHeader && (
          <div className="mb-3">
            <span className="text-xs uppercase tracking-widest text-white/50">{ticker}</span>
          </div>
        )}
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
  const minClose = Math.min(...closes)
  const maxClose = Math.max(...closes)

  const allValues = bars.flatMap((b) => [b.open, b.high, b.low, b.close])
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
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
  const changeColor = isPositive ? 'text-dash-green' : 'text-dash-red'
  const changeSign = isPositive ? '+' : ''

  const lineColor = lineColorProp ?? (isPositive ? '#00cc66' : '#ff4444')
  const gradientId = `price-grad-${ticker}`

  const lastX = toX(bars.length - 1)
  const lastY = toY(lastClose)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W
    const idx = Math.round(((svgX - padX) / chartW) * (bars.length - 1))
    if (idx >= 0 && idx < bars.length) {
      setHoverIndex(idx)
    } else {
      setHoverIndex(null)
    }
  }

  function handleMouseLeave() {
    setHoverIndex(null)
  }

  const hoverBar = hoverIndex !== null ? bars[hoverIndex] : null
  const hoverX = hoverIndex !== null ? toX(hoverIndex) : 0
  const hoverY = hoverBar ? toY(hoverBar.close) : 0

  const candleWidth = Math.max(4, Math.min(12, chartW / bars.length * 0.6))

  const eventIndices = events
    ?.map((event) => ({
      ...event,
      index: bars.findIndex((bar) => bar.date === event.date),
    }))
    .filter((e) => e.index !== -1)

  return (
    <div ref={containerRef}>
      {!hideHeader && (
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
      )}

      <div className="flex items-center justify-between mb-3">
        {!hideTimeframes && onTimeframeChange && (
          <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06] w-fit">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={cn(
                  'px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 rounded-md',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  'min-h-[28px] flex items-center justify-center',
                  timeframe === tf
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.05]',
                )}
                aria-label={`View ${tf} chart`}
                aria-pressed={timeframe === tf}
              >
                {tf}
              </button>
            ))}
          </div>
        )}

        {!hideChartToggle && onChartTypeChange && (
          <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06] w-fit">
            <button
              onClick={() => onChartTypeChange('line')}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                chartType === 'line'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.05]',
              )}
              aria-label="Switch to line chart"
              aria-pressed={chartType === 'line'}
              title="Line Chart"
            >
              <LineChart className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onChartTypeChange('candle')}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                chartType === 'candle'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.05]',
              )}
              aria-label="Switch to candlestick chart"
              aria-pressed={chartType === 'candle'}
              title="Candlestick Chart"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        aria-label={`${ticker} price chart`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.20} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines - dashed */}
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

        {chartType === 'line' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Candlesticks */}
            {bars.map((bar, i) => {
              const x = toX(i)
              const yOpen = toY(bar.open)
              const yClose = toY(bar.close)
              const yHigh = toY(bar.high)
              const yLow = toY(bar.low)
              const isUp = bar.close >= bar.open
              const candleColor = isUp ? '#00cc66' : '#ff4444'
              const bodyTop = Math.min(yOpen, yClose)
              const bodyHeight = Math.abs(yClose - yOpen)

              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x}
                    x2={x}
                    y1={yHigh}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth={1}
                  />
                  {/* Body */}
                  {bodyHeight > 0 ? (
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={Math.max(bodyHeight, 1)}
                      fill={candleColor}
                    />
                  ) : (
                    <line
                      x1={x - candleWidth / 2}
                      x2={x + candleWidth / 2}
                      y1={yOpen}
                      y2={yOpen}
                      stroke={candleColor}
                      strokeWidth={1}
                    />
                  )}
                </g>
              )
            })}
          </>
        )}

        {/* Crosshair on hover */}
        {hoverBar && hoverIndex !== null && (
          <g>
            {/* Vertical line */}
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD_TOP}
              y2={PAD_TOP + chartH}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {/* Horizontal line */}
            <line
              x1={padX}
              x2={VIEW_W - padX}
              y1={hoverY}
              y2={hoverY}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {/* Dot */}
            <circle
              cx={hoverX}
              cy={hoverY}
              r={4}
              fill={lineColor}
              stroke="#0a0a0a"
              strokeWidth={2}
            />
            {/* Tooltip bg */}
            <rect
              x={hoverX - 50}
              y={hoverY - 32}
              width={100}
              height={22}
              rx={2}
              fill="#1a1a1a"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            {/* Tooltip text */}
            <text
              x={hoverX}
              y={hoverY - 18}
              textAnchor="middle"
              fontSize={9}
              fill="#e0e0e0"
              fontFamily="monospace"
            >
              {hoverBar.date} · {fmtPrice(hoverBar.close)}
            </text>
          </g>
        )}

        {/* Event markers */}
        {eventIndices && eventIndices.length > 0 && (
          <g className="chart-events" role="list" aria-label="Chart events">
            {eventIndices.map((event, i) => {
              const x = toX(event.index)
              const color =
                event.type === 'dividend'
                  ? '#f97316'
                  : event.type === 'reverse-split'
                  ? '#ff4444'
                  : '#00cc66'
              const label =
                event.type === 'dividend' ? 'D' : event.type === 'reverse-split' ? 'RS' : 'S'
              const typeLabel =
                event.type === 'dividend' ? 'Dividend' : event.type === 'reverse-split' ? 'Reverse Split' : 'Split'

              return (
                <g
                  key={i}
                  className="group cursor-pointer"
                  role="listitem"
                  aria-label={`${typeLabel}: ${event.description} on ${event.date}`}
                >
                  <circle
                    cx={x}
                    cy={PAD_TOP + chartH + 12}
                    r={7}
                    fill={color}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth={1}
                    className="transition-all duration-200 group-hover:r-8"
                  />
                  <text
                    x={x}
                    y={PAD_TOP + chartH + 16}
                    textAnchor="middle"
                    fill="#0a0a0a"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                  <title>{event.description}</title>
                </g>
              )
            })}
          </g>
        )}

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
