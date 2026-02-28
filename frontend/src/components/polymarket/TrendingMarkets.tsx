import { TrendingUp, ExternalLink } from 'lucide-react'
import type { PolymarketEvent } from '../../types'
import { ProbabilityBar } from './ProbabilityBar'

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function getActiveMarket(event: PolymarketEvent) {
  return event.markets.find((m) => m.active && !m.closed) ?? event.markets[0]
}

interface TrendingMarketsProps {
  events: PolymarketEvent[]
  loading: boolean
}

export function TrendingMarkets({ events, loading }: TrendingMarketsProps) {
  if (loading) {
    return (
      <article className="glass-card rounded-xl p-3">
        <header className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
          <h3 className="text-sm font-semibold text-dash-text">Trending</h3>
        </header>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[220px] h-[100px] rounded-lg bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </article>
    )
  }

  if (!events.length) return null

  return (
    <article className="glass-card rounded-xl p-3">
      <header className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
        <h3 className="text-sm font-semibold text-dash-text">Trending</h3>
        <span className="text-[10px] text-white/40 font-mono ml-auto">{events.length} markets</span>
      </header>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {events.map((event) => {
          const market = getActiveMarket(event)
          const outcomes = market?.outcomes ?? []
          const prices = market?.outcome_prices ?? []

          return (
            <a
              key={event.id}
              href={`https://polymarket.com/event/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-w-[230px] max-w-[250px] shrink-0 rounded-lg bg-white/[0.03]
                         border border-white/[0.06] p-2.5 hover:border-accent/40
                         transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <p className="text-[11px] font-medium text-dash-text leading-tight line-clamp-2 flex-1">
                  {event.title}
                </p>
                <ExternalLink className="w-3 h-3 text-white/15 group-hover:text-accent shrink-0 mt-0.5 transition-colors" />
              </div>
              <div className="space-y-0.5">
                {outcomes.slice(0, 2).map((outcome, i) => (
                  <ProbabilityBar key={outcome} label={outcome} probability={prices[i] ?? 0} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.05]">
                <span className="text-[9px] font-mono font-medium text-[#f97316]">
                  24h {formatVolume(event.volume_24hr)}
                </span>
                {event.category && (
                  <span className="text-[9px] font-medium uppercase tracking-wider text-white/40">
                    {event.category}
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </article>
  )
}
