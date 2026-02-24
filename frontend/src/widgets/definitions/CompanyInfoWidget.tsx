import { useState } from 'react'
import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { useCompany } from '../../hooks/useCompany'

function CompanyInfoWidget({ config, onConfigChange }: WidgetProps) {
  const ticker = (config.ticker as string) || ''
  const [input, setInput] = useState(ticker)
  const { data, loading, error } = useCompany(ticker)

  function handleGo() {
    const t = input.trim().toUpperCase()
    if (t && t !== ticker) {
      onConfigChange({ ...config, ticker: t })
    }
  }

  function fmtMarketCap(val: number): string {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
    return `$${val.toLocaleString()}`
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          placeholder="Ticker"
          className="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-dash-text placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={handleGo}
          className="px-2 py-1 text-xs font-medium bg-white/10 hover:bg-white/15 rounded-md text-dash-text transition-colors"
        >
          Go
        </button>
      </div>

      {!ticker && (
        <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
          Enter a ticker to view company info
        </div>
      )}

      {ticker && loading && (
        <div className="flex-1 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-16 animate-pulse rounded bg-white/5" />
        </div>
      )}

      {ticker && error && (
        <p className="text-xs text-dash-red">{error}</p>
      )}

      {ticker && data && !loading && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
          <div className="flex items-center gap-3">
            {data.logo_url && (
              <img
                src={data.logo_url}
                alt={data.name}
                className="w-8 h-8 rounded-md bg-white/5 object-contain"
              />
            )}
            <div>
              <h3 className="text-sm font-semibold text-dash-text">{data.name}</h3>
              <p className="text-xs text-white/40">{data.ticker} &middot; {data.primary_exchange}</p>
            </div>
          </div>

          {data.sic_description && (
            <p className="text-xs text-white/50">{data.sic_description}</p>
          )}

          {data.description && (
            <p className="text-xs text-white/40 line-clamp-4">{data.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.market_cap !== null && (
              <div className="bg-white/[0.03] rounded-lg px-2.5 py-2">
                <p className="text-white/40">Market Cap</p>
                <p className="text-dash-text font-medium">{fmtMarketCap(data.market_cap)}</p>
              </div>
            )}
            {data.total_employees !== null && (
              <div className="bg-white/[0.03] rounded-lg px-2.5 py-2">
                <p className="text-white/40">Employees</p>
                <p className="text-dash-text font-medium">{data.total_employees.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

registerWidget({
  type: 'company-info',
  name: 'Company Info',
  description: 'Company details, market cap, and description',
  icon: 'Building2',
  category: 'research',
  defaultConfig: { ticker: '' },
  defaultLayout: { w: 4, h: 8, minW: 3, minH: 5 },
  component: CompanyInfoWidget,
})
