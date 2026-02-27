import {
  TrendingUp,
  TrendingDown,
  Terminal,
  ArrowRight,
  Flame,
  Search,
  BarChart3,
  Crosshair,
} from 'lucide-react'
import { useMarketIndices } from '../../hooks/useMarketIndices'
import { useQuotes } from '../../hooks/useQuotes'
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents'
import { useClock } from '../../hooks/useClock'
import type { ViewId } from './NavTabs'

const TICKER_STRIP = ['SPY', 'QQQ', 'DIA', 'IWM', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'AMD', 'NFLX', 'JPM']

function fmtPrice(v: number): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}

interface HomePageProps {
  onOpenTerminal: () => void
  onNavigate: (view: ViewId) => void
}

export function HomePage({ onOpenTerminal, onNavigate }: HomePageProps) {
  const { data: indices, loading: indicesLoading } = useMarketIndices()
  const { quotes } = useQuotes(TICKER_STRIP)
  const { data: events } = useUpcomingEvents()
  const now = useClock()

  const greeting = (() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Upcoming events — next 5 within 7 days
  const upcomingFiltered = events
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 7)
    .slice(0, 5)

  // Build ticker items for the marquee — render two copies for seamless loop
  const tickerItems = TICKER_STRIP.map((ticker) => {
    const q = quotes.find((q) => q.ticker === ticker)
    const pct = q?.change_percent ?? 0
    const isUp = pct >= 0
    return { ticker, q, pct, isUp }
  })

  return (
    <main className="animate-fade-in pb-10">
      {/* ── Page content ── */}
      <div className="px-4 md:px-10 py-8 max-w-[1200px] mx-auto">

        {/* ── Greeting + Date ── */}
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-medium text-dash-text mb-0.5">{greeting}</h1>
            <p className="text-xs text-white/20 font-mono">{dateStr}</p>
          </div>
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors cursor-pointer text-xs font-mono"
          >
            <Terminal className="w-3.5 h-3.5" />
            Open Terminal
          </button>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* ── Left Column: Indices ── */}
          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-3">Market Indices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {indicesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-dash-surface border border-white/5 rounded-lg p-4 animate-pulse">
                      <div className="h-3 bg-white/5 rounded w-12 mb-3" />
                      <div className="h-5 bg-white/5 rounded w-20 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-14" />
                    </div>
                  ))
                : indices.slice(0, 8).map((idx) => {
                    const isUp = idx.changePercent >= 0
                    return (
                      <div key={idx.id} className="bg-dash-surface border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-white/30 truncate">{idx.ticker}</span>
                          {isUp ? (
                            <TrendingUp className="w-3 h-3 text-dash-green shrink-0" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-dash-red shrink-0" />
                          )}
                        </div>
                        <div className="text-[15px] font-mono font-semibold text-dash-text leading-none mb-1.5">
                          {fmtPrice(idx.price)}
                        </div>
                        <div className={`text-[11px] font-mono ${isUp ? 'text-dash-green' : 'text-dash-red'}`}>
                          {fmtPct(idx.changePercent)}
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>

          {/* ── Right Column: Upcoming Events ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/20">Upcoming</h2>
              <button
                onClick={() => onNavigate('us-economics')}
                className="text-[9px] font-mono text-white/20 hover:text-white/40 transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="bg-dash-surface border border-white/5 rounded-lg overflow-hidden">
              {upcomingFiltered.length === 0 ? (
                <div className="px-4 py-8 text-center text-[11px] text-white/20 font-mono">No events this week</div>
              ) : (
                upcomingFiltered.map((evt) => {
                  const priorityColor =
                    evt.priority === 'HIGH'
                      ? 'bg-dash-red'
                      : evt.priority === 'MEDIUM'
                        ? 'bg-dash-yellow'
                        : 'bg-white/20'
                  const dayLabel =
                    evt.daysUntil === 0 ? 'Today' : evt.daysUntil === 1 ? 'Tomorrow' : `${evt.daysUntil}d`
                  return (
                    <div key={evt.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-b-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor}`} />
                      <span className="text-[11px] font-mono text-dash-text truncate flex-1">{evt.name}</span>
                      <span className="text-[10px] font-mono text-white/25 shrink-0">{dayLabel}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Navigation Cards ── */}
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-3">Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NavCard
            icon={<Flame className="w-4 h-4" />}
            label="US Economics"
            description="Indicators & calendar"
            color="text-dash-red"
            onClick={() => onNavigate('us-economics')}
          />
          <NavCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Markets"
            description="Indices & sectors"
            color="text-dash-green"
            onClick={() => onNavigate('markets')}
          />
          <NavCard
            icon={<Search className="w-4 h-4" />}
            label="Research"
            description="Company deep-dives"
            color="text-accent-blue"
            onClick={() => onNavigate('research')}
          />
          <NavCard
            icon={<Crosshair className="w-4 h-4" />}
            label="Scanner"
            description="Inside day patterns"
            color="text-dash-yellow"
            onClick={() => onNavigate('scanner')}
          />
        </div>
      </div>

      {/* ── Ticker Marquee — fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-sm overflow-hidden z-40">
        <div className="flex animate-marquee w-max">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div
              key={`${item.ticker}-${i}`}
              className="flex items-center gap-2 px-5 py-1.5 shrink-0"
            >
              <span className="text-[11px] font-mono font-bold text-dash-text">{item.ticker}</span>
              {item.q && item.q.last > 0 ? (
                <>
                  <span className="text-[11px] font-mono text-white/35">{fmtPrice(item.q.last)}</span>
                  <span className={`text-[10px] font-mono font-medium ${item.isUp ? 'text-dash-green' : 'text-dash-red'}`}>
                    {fmtPct(item.pct)}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-mono text-white/15">--</span>
              )}
              <span className="text-white/[0.06] ml-3">|</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function NavCard({
  icon,
  label,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 bg-dash-surface border border-white/5 rounded-lg p-4 hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group text-left"
    >
      <div className={`${color} mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-medium text-dash-text block leading-tight mb-0.5">{label}</span>
        <span className="text-[10px] text-white/25 font-mono">{description}</span>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/25 transition-colors shrink-0 mt-0.5" />
    </button>
  )
}
