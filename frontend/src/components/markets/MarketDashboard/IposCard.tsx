import { cn } from '../../../lib/utils'
import { Badge } from '../../ui/Badge'
import { Skeleton } from '../../ui/Skeleton'
import { useRecentIpos } from '../../../hooks/useRecentIpos'

interface IposCardProps {
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function IposCard({ className }: IposCardProps) {
  const { data: ipos, loading, error } = useRecentIpos()
  const displayIpos = ipos.slice(0, 5)

  return (
    <article
      className={cn(
        'glass-card rounded-xl p-3 flex flex-col',
        'transition-all duration-200 ease-out',
        className
      )}
      aria-busy={loading}
      aria-label="Recent IPOs card"
    >
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dash-text">Recent IPOs</h3>
        <span className="text-[10px] text-dash-muted font-mono" aria-label={`${displayIpos.length} IPOs`}>
          {displayIpos.length}
        </span>
      </header>

      <div className="space-y-1 flex-1" role="list" aria-label="Recent IPOs list">
        {loading ? (
          <div className="space-y-2" aria-label="Loading IPOs">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center" role="alert" aria-label="IPOs error">
            <p className="text-xs text-dash-red">Failed to load IPOs</p>
            <p className="text-[10px] text-dash-muted mt-1">{error}</p>
          </div>
        ) : displayIpos.length === 0 ? (
          <div className="py-4 text-center" role="status" aria-label="No IPOs available">
            <p className="text-xs text-dash-muted">No recent IPOs</p>
            <p className="text-[10px] text-dash-muted/60 mt-1">Check back later</p>
          </div>
        ) : (
          displayIpos.map((ipo) => (
            <div
              key={`${ipo.ticker}-${ipo.listing_date}`}
              className={cn(
                'flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg',
                'group cursor-pointer',
                'transition-colors duration-150 ease-out',
                'hover:bg-white/[0.03]',
                'min-h-[32px]'
              )}
              role="listitem"
              tabIndex={0}
              aria-label={`${ipo.ticker} listed ${formatDate(ipo.listing_date)}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-dash-text">
                  {ipo.ticker}
                </span>
                <span className="text-[10px] text-dash-muted truncate max-w-[80px]">
                  {ipo.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dash-muted font-mono">
                  {formatDate(ipo.listing_date)}
                </span>
                <Badge variant="muted" className="text-[9px] px-1.5 py-0.5">
                  IPO
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}
