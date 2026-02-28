import { ExternalLink } from 'lucide-react'
import type { PolymarketEvent } from '../../types'
import { ProbabilityBar } from './ProbabilityBar'

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(0)}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CATEGORY_COLORS: Record<string, { badge: string; accent: string }> = {
  politics: { badge: 'bg-dash-red/15 text-dash-red', accent: 'hover:border-dash-red/30' },
  crypto: { badge: 'bg-[#f97316]/15 text-[#f97316]', accent: 'hover:border-[#f97316]/30' },
  sports: { badge: 'bg-dash-green/15 text-dash-green', accent: 'hover:border-dash-green/30' },
  culture: { badge: 'bg-[#a855f7]/15 text-[#a855f7]', accent: 'hover:border-[#a855f7]/30' },
  science: { badge: 'bg-[#3b82f6]/15 text-[#3b82f6]', accent: 'hover:border-[#3b82f6]/30' },
}

const DEFAULT_COLORS = { badge: 'bg-white/5 text-white/50', accent: 'hover:border-accent/30' }

interface EventCardProps {
  event: PolymarketEvent
}

export function EventCard({ event }: EventCardProps) {
  const catKey = (event.category ?? '').toLowerCase()
  const colors = CATEGORY_COLORS[catKey] ?? DEFAULT_COLORS
  const visibleMarkets = event.markets.slice(0, 3)
  const remaining = event.markets.length - 3

  return (
    <a
      href={`https://polymarket.com/event/${event.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card rounded-xl p-3 flex flex-col transition-all duration-200 ease-out
                  group cursor-pointer ${colors.accent}`}
    >
      <header className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-semibold text-dash-text leading-tight line-clamp-2 flex-1 group-hover:text-accent transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {event.category && (
            <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${colors.badge}`}>
              {event.category}
            </span>
          )}
          <ExternalLink className="w-3 h-3 text-white/15 group-hover:text-accent transition-colors" />
        </div>
      </header>

      <div className="space-y-1.5 flex-1">
        {visibleMarkets.map((market) => {
          const outcomes = market.outcomes.slice(0, 2)
          const prices = market.outcome_prices.slice(0, 2)

          if (event.markets.length > 1) {
            return (
              <div key={market.id} className="py-1 px-1.5 -mx-1.5 rounded-md">
                <p className="text-[10px] text-white/50 mb-1 truncate">{market.question}</p>
                {outcomes.map((outcome, i) => (
                  <ProbabilityBar key={outcome} label={outcome} probability={prices[i] ?? 0} />
                ))}
              </div>
            )
          }

          return (
            <div key={market.id}>
              {outcomes.map((outcome, i) => (
                <ProbabilityBar key={outcome} label={outcome} probability={prices[i] ?? 0} />
              ))}
            </div>
          )
        })}
        {remaining > 0 && (
          <p className="text-[9px] text-white/40 pl-1">+{remaining} more</p>
        )}
      </div>

      <footer className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.05]">
        <span className="text-[10px] font-mono font-semibold text-[#f97316]">
          Vol {formatVolume(event.volume)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/50">
            24h {formatVolume(event.volume_24hr)}
          </span>
          {event.markets[0]?.end_date && (
            <span className="text-[10px] font-mono text-white/40">
              {formatDate(event.markets[0].end_date)}
            </span>
          )}
        </div>
      </footer>
    </a>
  )
}
