import type { OHLCBar } from '../../types'

const VIEW_W = 700
const VIEW_H = 200
const PAD_X = 52
const PAD_TOP = 40
const PAD_BOT = 28
const ACCENT = '#771128'

interface Props {
  ticker: string
  bars: OHLCBar[]
  latestClose?: number
  loading: boolean
}

function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

export function PriceChart({ ticker, bars, latestClose, loading }: Props) {
  const chartW = VIEW_W - PAD_X * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOT

  if (loading) {
    return (
      <div>
        <div className="flex items-baseline gap-3 mb-3">
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
    return PAD_X + (i / (bars.length - 1)) * chartW
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

  const firstClose = bars[0].close
  const lastClose = bars[bars.length - 1].close
  const displayClose = latestClose ?? lastClose
  const change = lastClose - firstClose
  const changePct = (change / firstClose) * 100
  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400'
  const changeSign = isPositive ? '+' : ''

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs uppercase tracking-widest text-white/50">{ticker}</span>
        <span className="text-xl font-display font-semibold text-white">
          {fmtPrice(displayClose)}
        </span>
        <span className={`text-xs font-mono ${changeColor}`}>
          {changeSign}{change.toFixed(2)} ({changeSign}{changePct.toFixed(2)}%)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        aria-label={`${ticker} price chart`}
      >
        <defs>
          <linearGradient id="price-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_X}
              x2={VIEW_W - PAD_X}
              y1={toY(v)}
              y2={toY(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={VIEW_W - PAD_X + 4}
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

        {/* Area fill */}
        <path d={areaD} fill="url(#price-grad)" />

        {/* Line */}
        <path
          d={linePts}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* X-axis date labels */}
        <text
          x={PAD_X}
          y={VIEW_H - 4}
          textAnchor="start"
          fontSize={9}
          fill="rgba(255,255,255,0.25)"
          fontFamily="monospace"
        >
          {bars[0].date}
        </text>
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
    </div>
  )
}
