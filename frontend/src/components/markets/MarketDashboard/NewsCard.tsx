import { cn } from '../../../lib/utils'
import { Badge } from '../../ui/Badge'
import { Skeleton } from '../../ui/Skeleton'
import { useMarketNews } from '../../../hooks/useMarketNews'

interface NewsCardProps {
  className?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NewsCard({ className }: NewsCardProps) {
  const { data: news, loading, error } = useMarketNews(5)

  return (
    <article
      className={cn(
        'glass-card rounded-xl p-3 flex flex-col',
        'transition-all duration-200 ease-out',
        className
      )}
      aria-busy={loading}
      aria-label="Market news card"
    >
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dash-text">Market News</h3>
        <span className="text-[10px] text-dash-muted font-mono" aria-label={`${news.length} articles`}>
          {news.length}
        </span>
      </header>

      <div className="space-y-0 divide-y divide-white/[0.04] flex-1" role="feed" aria-label="Market news feed">
        {loading ? (
          <div className="space-y-2" aria-label="Loading news">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="py-4 text-center"
            role="alert"
            aria-label="News error"
          >
            <p className="text-xs text-dash-red">Failed to load news</p>
            <p className="text-[10px] text-dash-muted mt-1">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="py-4 text-center" role="status" aria-label="No news available">
            <p className="text-xs text-dash-muted">No recent news available</p>
          </div>
        ) : (
          news.map((item) => (
            <a
              key={item.id}
              href={item.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group block py-1.5 px-2 -mx-2 rounded-lg',
                'transition-colors duration-150 ease-out',
                'hover:bg-white/[0.04]',
                'focus:outline-none focus:ring-2 focus:ring-accent/50'
              )}
              aria-label={`${item.title}, ${formatDate(item.published_utc)}`}
              role="article"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className={cn(
                    'text-xs text-dash-text line-clamp-2',
                    'group-hover:text-accent transition-colors duration-150'
                  )}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-dash-muted font-mono">
                      {formatDate(item.published_utc)}
                    </span>
                    {item.tickers.slice(0, 2).map((ticker) => (
                      <Badge key={ticker} variant="muted" className="text-[9px] px-1 py-0">
                        {ticker}
                      </Badge>
                    ))}
                    {item.tickers.length > 2 && (
                      <span className="text-[9px] text-dash-muted">
                        +{item.tickers.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="w-3 h-3 text-dash-muted/40 group-hover:text-accent shrink-0 mt-0.5 transition-colors duration-150"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))
        )}
      </div>
    </article>
  )
}
