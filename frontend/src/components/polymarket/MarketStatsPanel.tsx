import { BarChart3, Activity, TrendingUp, DollarSign, Droplets, Target, ChevronRight } from 'lucide-react'
import type { PolymarketStats } from '../../types'

function formatLargeNumber(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

const CAT_COLORS: Record<string, { badge: string; bar: string; text: string }> = {
  politics: { badge: 'bg-dash-red/15 text-dash-red border-dash-red/20', bar: 'bg-dash-red', text: 'text-dash-red' },
  crypto: { badge: 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/20', bar: 'bg-[#f97316]', text: 'text-[#f97316]' },
  sports: { badge: 'bg-dash-green/15 text-dash-green border-dash-green/20', bar: 'bg-dash-green', text: 'text-dash-green' },
  culture: { badge: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/20', bar: 'bg-[#a855f7]', text: 'text-[#a855f7]' },
  science: { badge: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20', bar: 'bg-[#3b82f6]', text: 'text-[#3b82f6]' },
}

const DEFAULT_CAT_COLORS = { badge: 'bg-white/5 text-white/50 border-white/10', bar: 'bg-white/30', text: 'text-white/50' }

interface MarketStatsPanelProps {
  stats: PolymarketStats | null
  loading: boolean
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function MarketStatsPanel({ stats, loading, activeCategory, onCategoryChange }: MarketStatsPanelProps) {
  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="glass-card rounded-xl p-3">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-white/[0.03] p-3">
                <div className="h-2.5 w-12 rounded bg-white/[0.04] animate-pulse mb-2" />
                <div className="h-5 w-20 rounded bg-white/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Active Markets', value: stats.active_markets.toLocaleString(), icon: Target, color: 'text-[#3b82f6]', iconBg: 'bg-[#3b82f6]/15', borderColor: 'border-[#3b82f6]/20' },
    { label: '24h Volume', value: formatLargeNumber(stats.total_volume_24hr), icon: TrendingUp, color: 'text-dash-green', iconBg: 'bg-dash-green/15', borderColor: 'border-dash-green/20' },
    { label: 'Open Interest', value: formatLargeNumber(stats.total_open_interest), icon: DollarSign, color: 'text-[#f97316]', iconBg: 'bg-[#f97316]/15', borderColor: 'border-[#f97316]/20' },
    { label: 'Liquidity', value: formatLargeNumber(stats.total_liquidity), icon: Droplets, color: 'text-[#a855f7]', iconBg: 'bg-[#a855f7]/15', borderColor: 'border-[#a855f7]/20' },
  ]

  const maxCatCount = Math.max(...stats.categories.map((c) => c.count), 1)

  return (
    <div className="flex flex-col gap-4">
      {/* Hero stat cards in a 2x2 grid */}
      <article className="glass-card rounded-xl p-3">
        <header className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-dash-green" />
          <h3 className="text-sm font-semibold text-dash-text">Market Overview</h3>
        </header>
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className={`rounded-lg bg-white/[0.03] border ${card.borderColor} p-2.5 transition-colors hover:bg-white/[0.05]`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${card.iconBg}`}>
                    <Icon className={`w-3 h-3 ${card.color}`} />
                  </div>
                  <span className="text-[9px] text-white/50 uppercase tracking-wider">{card.label}</span>
                </div>
                <span className={`text-sm font-mono font-semibold ${card.color}`}>{card.value}</span>
              </div>
            )
          })}
        </div>
      </article>

      {/* Clickable category list with volume bars */}
      <article className="glass-card rounded-xl p-3">
        <header className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3.5 h-3.5 text-[#a855f7]" />
          <h3 className="text-sm font-semibold text-dash-text">Browse Categories</h3>
          <span className="text-[10px] text-white/40 font-mono ml-auto">
            {stats.categories.length}
          </span>
        </header>
        <div className="space-y-1">
          {stats.categories.slice(0, 10).map((cat) => {
            const colors = CAT_COLORS[cat.name.toLowerCase()] ?? DEFAULT_CAT_COLORS
            const barWidth = Math.max((cat.count / maxCatCount) * 100, 4)
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase()

            return (
              <button
                key={cat.name}
                onClick={() => onCategoryChange(isActive ? 'All' : cat.name)}
                className={[
                  'flex items-center gap-2 w-full py-1.5 px-2 -mx-2 rounded-lg min-h-[36px]',
                  'transition-all duration-150 cursor-pointer group text-left',
                  isActive
                    ? 'bg-white/[0.06] ring-1 ring-white/10'
                    : 'hover:bg-white/[0.03]',
                ].join(' ')}
              >
                <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0 ${colors.badge}`}>
                  {cat.name}
                </span>
                <div className="flex-1 h-[4px] rounded-full bg-white/[0.04] overflow-hidden mx-1">
                  <div
                    className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                    style={{ width: `${barWidth}%`, opacity: isActive ? 1 : 0.6 }}
                  />
                </div>
                <span className={`text-[10px] font-mono font-medium shrink-0 ${isActive ? colors.text : 'text-white/50'}`}>
                  {cat.count}
                </span>
                <ChevronRight className={`w-3 h-3 shrink-0 transition-all duration-150 ${isActive ? `${colors.text} translate-x-0` : 'text-white/15 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </button>
            )
          })}
        </div>
      </article>
    </div>
  )
}
