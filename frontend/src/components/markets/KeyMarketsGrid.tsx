import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatNumber, formatChange, formatPercent } from '../../lib/utils'
import { Skeleton } from '../ui/Skeleton'
import { useQuotes } from '../../hooks/useQuotes'
import type { TickerQuote } from '../../types'

const TICKER_META: Record<string, { name: string; category: string }> = {
  SPY:  { name: 'S&P 500',    category: 'INDEX' },
  QQQ:  { name: 'NASDAQ 100', category: 'INDEX' },
  IWM:  { name: 'Russell 2000', category: 'INDEX' },
  GLD:  { name: 'Gold',       category: 'COMMODITY' },
  SLV:  { name: 'Silver',     category: 'COMMODITY' },
  GBTC: { name: 'Bitcoin',    category: 'CRYPTO' },
}

const TICKERS = Object.keys(TICKER_META)

export function KeyMarketsGrid() {
  const { quotes, loading, error } = useQuotes(TICKERS)

  return (
    <section className="glass-card rounded-xl p-4">
      <header className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-dash-text">Key Markets</h2>
          <p className="text-[11px] text-dash-muted mt-0.5">Today's performance</p>
        </div>
        <span className="text-[10px] text-white/20 font-mono">Live data · 15s refresh</span>
      </header>

      {error ? (
        <div className="py-8 text-center">
          <p className="text-xs text-dash-red">Failed to load quotes</p>
          <p className="text-[10px] text-dash-muted mt-1">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-dash-surface border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-20 mb-4" />
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))
            : TICKERS.map((ticker) => {
                const quote = quotes.find((q) => q.ticker === ticker)
                return <QuoteCard key={ticker} ticker={ticker} quote={quote} />
              })}
        </div>
      )}
    </section>
  )
}

function QuoteCard({ ticker, quote }: { ticker: string; quote: TickerQuote | undefined }) {
  const meta = TICKER_META[ticker]
  const isUp = (quote?.change ?? 0) >= 0
  const hasData = quote && quote.last > 0

  return (
    <div
      className={cn(
        'bg-dash-surface border border-white/5 rounded-xl p-4',
        'hover:border-white/10 transition-colors'
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            {ticker}
          </span>
          <p className="text-xs text-dash-muted mt-0.5">{meta?.name ?? ticker}</p>
        </div>
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
            isUp ? 'bg-dash-green/15' : 'bg-dash-red/15'
          )}
        >
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-dash-red" />
          )}
        </div>
      </div>

      <div className="mt-3 mb-2">
        <span className="text-xl font-mono font-semibold text-dash-text leading-none">
          {hasData ? formatNumber(quote.last) : '--'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {hasData ? (
          <>
            <span className={cn('text-xs font-mono font-medium', isUp ? 'text-dash-green' : 'text-dash-red')}>
              {formatChange(quote.change)}
            </span>
            <span
              className={cn(
                'text-[11px] font-mono font-medium px-1.5 py-0.5 rounded',
                isUp
                  ? 'bg-dash-green/10 text-dash-green'
                  : 'bg-dash-red/10 text-dash-red'
              )}
            >
              {formatPercent(quote.change_percent)}
            </span>
          </>
        ) : (
          <span className="text-[10px] font-mono text-white/15">--</span>
        )}
      </div>
    </div>
  )
}
