import { Newspaper, Clock, ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/Skeleton'
import { useMarketNews } from '../../hooks/useMarketNews'
import type { MarketNewsItem } from '../../types'

const CATEGORY_CYCLE = [
  { label: 'POLICY', bg: 'bg-dash-red/15', text: 'text-dash-red' },
  { label: 'ECONOMY', bg: 'bg-[#3b82f6]/15', text: 'text-[#3b82f6]' },
  { label: 'TRADE', bg: 'bg-[#f97316]/15', text: 'text-[#f97316]' },
  { label: 'MARKETS', bg: 'bg-[#a855f7]/15', text: 'text-[#a855f7]' },
  { label: 'FINANCE', bg: 'bg-dash-green/15', text: 'text-dash-green' },
] as const

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHrs === 1) return '1 hour ago'
  if (diffHrs < 24) return `${diffHrs} hours ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export function KeyNewsSection() {
  const { data: news, loading, error } = useMarketNews(8)

  return (
    <section className="glass-card rounded-xl p-4 flex flex-col">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-dash-red" />
          <h2 className="text-base font-semibold text-dash-text">Key News</h2>
        </div>
        <span className="text-[10px] text-white/20 font-mono">Multiple sources</span>
      </header>

      <div className="max-h-[500px] overflow-y-auto space-y-0 divide-y divide-white/[0.06] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {loading ? (
          <div className="space-y-4 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-xs text-dash-red">Failed to load news</p>
            <p className="text-[10px] text-dash-muted mt-1">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-dash-muted">No recent news available</p>
          </div>
        ) : (
          news.map((item, i) => (
            <NewsArticle key={item.id} item={item} index={i} isFirst={i === 0} />
          ))
        )}
      </div>
    </section>
  )
}

function NewsArticle({ item, index, isFirst }: { item: MarketNewsItem; index: number; isFirst: boolean }) {
  const category = CATEGORY_CYCLE[index % CATEGORY_CYCLE.length]

  return (
    <a
      href={item.article_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block py-4 first:pt-0',
        'transition-colors duration-150'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
              category.bg, category.text
            )}
          >
            {category.label}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/25 font-mono">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(item.published_utc)}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-white/15 group-hover:text-accent transition-colors shrink-0" />
      </div>

      <h3
        className={cn(
          'text-sm font-semibold leading-snug mb-1.5',
          'group-hover:text-accent transition-colors duration-150',
          isFirst ? 'text-dash-red' : 'text-dash-text'
        )}
      >
        {item.title}
      </h3>

      {item.description && (
        <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2 mb-2.5">
          {item.description}
        </p>
      )}

      {item.publisher_name && (
        <p className="text-[10px] text-white/20">
          Source:{' '}
          <span className={cn('font-medium', category.text)}>
            {item.publisher_name}
          </span>
        </p>
      )}
    </a>
  )
}
