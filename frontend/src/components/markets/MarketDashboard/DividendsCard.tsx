import { cn } from '../../../lib/utils'
import { Badge } from '../../ui/Badge'
import { Skeleton } from '../../ui/Skeleton'
import { useUpcomingDividends } from '../../../hooks/useUpcomingDividends'

interface DividendsCardProps {
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getFrequencyLabel(frequency: string | number | null | undefined): string {
  const freq = String(frequency ?? '').toUpperCase()
  if (freq === 'Q' || freq === '4') return 'Q'
  if (freq === 'A' || freq === '1') return 'A'
  if (freq === 'M' || freq === '12') return 'M'
  if (freq === 'S' || freq === '2') return 'S'
  return freq.charAt(0) || '-'
}

export function DividendsCard({ className }: DividendsCardProps) {
  const { data: dividends, loading, error } = useUpcomingDividends()
  const displayDividends = dividends.slice(0, 5)

  return (
    <article
      className={cn(
        'glass-card rounded-xl p-3 flex flex-col',
        'transition-all duration-200 ease-out',
        className
      )}
      aria-busy={loading}
      aria-label="Upcoming dividends card"
    >
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dash-text">Upcoming Dividends</h3>
        <span className="text-[10px] text-dash-muted font-mono" aria-label={`${displayDividends.length} dividends`}>
          {displayDividends.length}
        </span>
      </header>

      <div className="space-y-1 flex-1" role="list" aria-label="Upcoming dividends list">
        {loading ? (
          <div className="space-y-2" aria-label="Loading dividends">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="py-4 text-center"
            role="alert"
            aria-label="Dividends error"
          >
            <p className="text-xs text-dash-red">Failed to load dividends</p>
            <p className="text-[10px] text-dash-muted mt-1">{error}</p>
          </div>
        ) : displayDividends.length === 0 ? (
          <div className="py-4 text-center" role="status" aria-label="No dividends available">
            <p className="text-xs text-dash-muted">No upcoming dividends</p>
            <p className="text-[10px] text-dash-muted/60 mt-1">Check back later</p>
          </div>
        ) : (
          displayDividends.map((dividend) => (
            <div
              key={`${dividend.ticker}-${dividend.ex_dividend_date}`}
              className={cn(
                'flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg',
                'group cursor-pointer',
                'transition-colors duration-150 ease-out',
                'hover:bg-white/[0.03]',
                'focus:outline-none focus:ring-2 focus:ring-accent/50',
                'min-h-[32px]'
              )}
              role="listitem"
              tabIndex={0}
              aria-label={`${dividend.ticker} dividend of $${(dividend.cash_amount ?? 0).toFixed(2)} on ${formatDate(dividend.ex_dividend_date)}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-dash-text">
                  {dividend.ticker}
                </span>
                <span className="text-[10px] font-mono text-[#f97316]">
                  ${(dividend.cash_amount ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dash-muted font-mono">
                  {formatDate(dividend.ex_dividend_date)}
                </span>
                <Badge
                  variant="yellow"
                  className="text-[9px] px-1.5 py-0.5 border-[#f97316]/30 text-[#f97316] bg-[#f97316]/10"
                >
                  {getFrequencyLabel(dividend.frequency)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}
