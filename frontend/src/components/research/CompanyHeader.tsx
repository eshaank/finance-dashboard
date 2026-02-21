import type { CompanyDetails, InsideDayResult } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  input: string
  onInputChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  ticker: string
  company: CompanyDetails | null
  priceData: InsideDayResult | null
  loading: boolean
}

export function CompanyHeader({ input, onInputChange, onSubmit, ticker, company, priceData, loading }: Props) {
  const lastClose = priceData?.latest_close
  const bars = priceData?.bars ?? []
  const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : null
  const changePct =
    lastClose != null && prevClose != null && prevClose !== 0
      ? ((lastClose - prevClose) / prevClose) * 100
      : null
  const isPositive = changePct != null ? changePct >= 0 : true
  const changeSign = isPositive ? '+' : ''

  const glowStyle =
    ticker && priceData
      ? {
          boxShadow: isPositive
            ? '0 0 40px rgba(16,185,129,0.07), inset 0 0 40px rgba(16,185,129,0.03)'
            : '0 0 40px rgba(244,63,94,0.07), inset 0 0 40px rgba(244,63,94,0.03)',
        }
      : undefined

  return (
    <div
      className="glass-card rounded-xl px-5 py-3.5 flex items-center gap-4 flex-wrap"
      style={glowStyle}
    >
      <form onSubmit={onSubmit} className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="TICKER"
            className="w-36 bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white uppercase placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 text-xs rounded-lg bg-accent text-white font-medium hover:bg-accent-light disabled:opacity-50 transition-all"
        >
          {loading ? '…' : 'Load'}
        </button>
      </form>

      {ticker && company && (
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-px h-8 bg-white/10 shrink-0" />
          {company.logo_url && (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-6 w-6 object-contain rounded-sm shrink-0"
            />
          )}
          <span className="text-sm font-medium text-white">{company.name}</span>
          {company.sic_description && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] border border-white/[0.08] text-white/60">
              {company.sic_description}
            </span>
          )}
          {company.primary_exchange && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-accent/20 border border-accent/30 text-accent-light">
              {company.primary_exchange}
            </span>
          )}
        </div>
      )}

      {lastClose != null && (
        <div className="ml-auto flex items-center gap-3 shrink-0 animate-fade-in">
          <span className="text-2xl font-display font-semibold text-white">
            ${lastClose.toFixed(2)}
          </span>
          {changePct != null && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-md text-sm font-mono font-medium',
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400',
              )}
            >
              {changeSign}{changePct.toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
