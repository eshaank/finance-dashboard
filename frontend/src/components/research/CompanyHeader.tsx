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
  const firstClose = bars.length > 0 ? bars[0].close : null
  const changePct =
    lastClose != null && firstClose != null && firstClose !== 0
      ? ((lastClose - firstClose) / firstClose) * 100
      : null
  const isPositive = changePct != null ? changePct >= 0 : true
  const changeSign = isPositive ? '+' : ''

  return (
    <div className="glass-card px-4 py-3 flex items-center gap-4 flex-wrap">
      <form onSubmit={onSubmit} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="TICKER"
          className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white uppercase placeholder-white/30 focus:outline-none focus:border-white/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '…' : 'Load'}
        </button>
      </form>

      {ticker && company && (
        <>
          <div className="w-px h-5 bg-white/10 shrink-0" />
          {company.logo_url && (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-5 w-5 object-contain rounded-sm shrink-0"
            />
          )}
          <span className="text-sm font-medium text-white">{company.name}</span>
          {company.sic_description && (
            <span className="text-xs text-white/40">{company.sic_description}</span>
          )}
          {company.primary_exchange && (
            <span className="text-xs text-white/30 font-mono">{company.primary_exchange}</span>
          )}
        </>
      )}

      {lastClose != null && (
        <div className="ml-auto flex items-baseline gap-2 shrink-0">
          <span className="text-base font-display font-semibold text-white">
            ${lastClose.toFixed(2)}
          </span>
          {changePct != null && (
            <span className={cn('text-xs font-mono', isPositive ? 'text-green-400' : 'text-red-400')}>
              {changeSign}{changePct.toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
