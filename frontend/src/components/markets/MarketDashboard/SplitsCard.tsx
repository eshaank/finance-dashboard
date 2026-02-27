import { cn } from '../../../lib/utils'
import { Badge } from '../../ui/Badge'
import { Skeleton } from '../../ui/Skeleton'
import { useUpcomingSplits } from '../../../hooks/useUpcomingSplits'

interface SplitsCardProps {
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

export function SplitsCard({ className }: SplitsCardProps) {
  const { data: splits, loading, error } = useUpcomingSplits()
  const displaySplits = splits.slice(0, 5)

  return (
    <article
      className={cn(
        'glass-card rounded-xl p-3 flex flex-col',
        'transition-all duration-200 ease-out',
        className
      )}
      aria-busy={loading}
      aria-label="Upcoming stock splits card"
    >
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dash-text">Upcoming Splits</h3>
        <span className="text-[10px] text-dash-muted font-mono" aria-label={`${displaySplits.length} splits`}>
          {displaySplits.length}
        </span>
      </header>

      <div className="space-y-1 flex-1" role="list" aria-label="Upcoming splits list">
        {loading ? (
          <div className="space-y-2" aria-label="Loading splits">
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
            aria-label="Splits error"
          >
            <p className="text-xs text-dash-red">Failed to load splits</p>
            <p className="text-[10px] text-dash-muted mt-1">{error}</p>
          </div>
        ) : displaySplits.length === 0 ? (
          <div className="py-4 text-center" role="status" aria-label="No splits available">
            <p className="text-xs text-dash-muted">No upcoming splits</p>
            <p className="text-[10px] text-dash-muted/60 mt-1">Check back later</p>
          </div>
        ) : (
          displaySplits.map((split) => {
            const isReverse = split.is_reverse
            const ratio = isReverse
              ? `RS ${split.split_from}:${split.split_to}`
              : `${split.split_to}:${split.split_from}`

            return (
              <div
                key={`${split.ticker}-${split.execution_date}`}
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
                aria-label={`${split.ticker} ${isReverse ? 'reverse split' : 'stock split'} on ${formatDate(split.execution_date)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-dash-text">
                    {split.ticker}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono',
                      isReverse ? 'text-dash-red' : 'text-dash-green'
                    )}
                  >
                    {ratio}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-dash-muted font-mono">
                    {formatDate(split.execution_date)}
                  </span>
                  <Badge
                    variant={isReverse ? 'red' : 'green'}
                    className="text-[9px] px-1.5 py-0.5"
                  >
                    {isReverse ? 'RS' : 'S'}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </div>
    </article>
  )
}
