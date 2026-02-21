import type { YearlyValues } from '../../types'

interface MiniSparklineProps {
  yearly: YearlyValues
  years?: string[]
  width?: number
  height?: number
}

export function MiniSparkline({
  yearly,
  years = ['2022', '2023', '2024'],
  width = 60,
  height = 24,
}: MiniSparklineProps) {
  const values = years.map((y) => yearly[y] ?? null).filter((v): v is number => v !== null)

  if (values.length < 2) {
    return (
      <svg width={width} height={height}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#ffffff20" strokeWidth={1} />
      </svg>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const pad = 2
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2))
  const ys = values.map((v) => pad + (1 - (v - min) / range) * (height - pad * 2))

  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')

  const trend = values[values.length - 1] > values[0]
  const stroke = trend ? '#22c55e' : '#ef4444'

  return (
    <svg width={width} height={height}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
