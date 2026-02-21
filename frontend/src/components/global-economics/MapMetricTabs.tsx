import type { IndicatorId } from '../../types'

export interface IndicatorConfig {
  id: IndicatorId
  label: string
  wbId: string
  format: (v: number) => string
}

export const INDICATORS: IndicatorConfig[] = [
  {
    id: 'gdp',
    label: 'GDP',
    wbId: 'NY.GDP.MKTP.CD',
    format: (v) => {
      if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
      if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
      return `$${(v / 1e6).toFixed(0)}M`
    },
  },
  {
    id: 'unemployment',
    label: 'Unemployment',
    wbId: 'SL.UEM.TOTL.ZS',
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'govtDebt',
    label: 'Govt Debt / GDP',
    wbId: 'GC.DOD.TOTL.GD.ZS',
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'interestRate',
    label: 'Interest Rate',
    wbId: 'FR.INR.LEND',
    format: (v) => `${v.toFixed(2)}%`,
  },
  {
    id: 'inflation',
    label: 'Inflation',
    wbId: 'FP.CPI.TOTL.ZG',
    format: (v) => `${v.toFixed(1)}%`,
  },
]

interface MapMetricTabsProps {
  active: IndicatorId
  onChange: (id: IndicatorId) => void
}

export function MapMetricTabs({ active, onChange }: MapMetricTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b border-white/5">
      {INDICATORS.map((ind) => (
        <button
          key={ind.id}
          onClick={() => onChange(ind.id)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            active === ind.id
              ? 'bg-orange-500/90 text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
          ].join(' ')}
        >
          {ind.label}
        </button>
      ))}
    </div>
  )
}
