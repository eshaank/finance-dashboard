import type { MarketIndex } from '../../types'
import { formatNumber } from '../../lib/utils'
import { ChangeBadge } from '../ui/ChangeBadge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MarketIndexCardProps {
  index: MarketIndex
}

export function MarketIndexCard({ index }: MarketIndexCardProps) {
  const isUp = index.trend === 'up'

  return (
    <div className="border border-dash-border bg-dash-surface p-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-widest">
            {index.ticker}
          </div>
          <div className="mt-0.5 text-xs text-dash-muted">{index.name}</div>
        </div>
        <div className="flex items-center gap-1">
          {isUp
            ? <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
            : <TrendingDown className="w-3.5 h-3.5 text-dash-red" />
          }
          <span className="text-[10px] text-white/30">{index.exchange}</span>
        </div>
      </div>

      <div className="mt-2">
        <div className="font-mono text-lg font-semibold text-dash-text">
          {formatNumber(index.price)}
        </div>
        <div className="mt-1">
          <ChangeBadge change={index.change} changePercent={index.changePercent} />
        </div>
      </div>
    </div>
  )
}
