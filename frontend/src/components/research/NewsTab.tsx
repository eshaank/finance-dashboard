import { useCompanyNews } from '../../hooks/useCompanyNews'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/Badge'

interface NewsTabProps {
  ticker: string
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

export function NewsTab({ ticker }: NewsTabProps) {
  const { data: news, loading, error } = useCompanyNews(ticker || null)
  const displayNews = news.slice(0, 10)

  if (loading) {
    return (
      <div
        className="glass-card rounded-xl p-5 animate-pulse"
        aria-busy="true"
        aria-label="Loading news"
      >
        <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-5" />
        <div className="space-y-4" role="status">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-2">
              <div className="h-3.5 bg-white/[0.04] rounded w-full mb-2" />
              <div className="h-2.5 bg-white/[0.04] rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="alert"
        aria-label="News error"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-dash-red/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-dash-red text-sm font-medium">Failed to load news</p>
        <p className="text-white/40 text-xs mt-2 max-w-xs mx-auto">{error}</p>
        <p className="text-white/30 text-xs mt-3">Try refreshing the page</p>
      </div>
    )
  }

  if (!displayNews || displayNews.length === 0) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="status"
        aria-label="No news available"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-white/50 text-sm">No news available for {ticker}</p>
        <p className="text-white/30 text-xs mt-2">Check back later for updates</p>
      </div>
    )
  }

  return (
    <div
      className="glass-card rounded-xl p-5 animate-slide-fade"
      role="feed"
      aria-label={`Recent news for ${ticker}`}
    >
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-white/30 font-medium">
          Recent News
        </h3>
        <span className="text-xs text-white/20 font-mono">{displayNews.length}</span>
      </header>

      <div className="space-y-0 divide-y divide-white/[0.06]">
        {displayNews.map((item) => (
          <a
            key={item.id}
            href={item.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group block py-3 px-2 -mx-2 rounded-lg',
              'transition-colors duration-150 ease-out',
              'hover:bg-white/[0.04]',
              'focus:outline-none focus:ring-2 focus:ring-accent/30',
            )}
            role="article"
            aria-label={`${item.title}, published ${formatDate(item.published_utc)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs text-white/80 line-clamp-2 group-hover:text-accent transition-colors duration-150">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[10px] text-white/35 line-clamp-1 mt-1 hidden group-hover:block">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-white/40 font-mono">
                    {formatDate(item.published_utc)}
                  </span>
                  {item.tickers.slice(0, 3).map((t) => (
                    <Badge key={t} variant="muted" className="text-[9px] px-1 py-0">
                      {t}
                    </Badge>
                  ))}
                  {item.tickers.length > 3 && (
                    <span className="text-[9px] text-white/30">
                      +{item.tickers.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-3 h-3 text-white/20 group-hover:text-accent shrink-0 mt-0.5 transition-colors duration-150"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
