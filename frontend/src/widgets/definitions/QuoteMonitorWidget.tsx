import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { useQuotes } from '../../hooks/useQuotes'

type SortKey = 'ticker' | 'last' | 'changePct' | 'volume'
type SortDir = 'asc' | 'desc'

function fmtVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toString()
}

function fmtPrice(v: number): string {
  return v.toFixed(2)
}

function fmtChange(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ', 'NVDA']

function QuoteMonitorWidget({ config, onConfigChange, onTickerChange }: WidgetProps) {
  const watchlist = (config.watchlist as string[] | undefined) ?? DEFAULT_WATCHLIST
  const { quotes, loading } = useQuotes(watchlist)

  const [sortKey, setSortKey] = useState<SortKey>('ticker')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [newTicker, setNewTicker] = useState('')

  const rows = useMemo(() => {
    return watchlist.map((ticker) => {
      const q = quotes.find((q) => q.ticker === ticker)
      return {
        ticker,
        last: q?.last ?? 0,
        changePct: q?.change_percent ?? 0,
        volume: q?.volume ?? 0,
      }
    })
  }, [watchlist, quotes])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      const diff = (av as number) - (bv as number)
      return sortDir === 'asc' ? diff : -diff
    })
    return copy
  }, [rows, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleAddTicker() {
    const t = newTicker.trim().toUpperCase()
    if (!t || watchlist.includes(t)) {
      setNewTicker('')
      return
    }
    onConfigChange({ ...config, watchlist: [...watchlist, t] })
    setNewTicker('')
  }

  function SortArrow({ column }: { column: SortKey }) {
    if (sortKey !== column) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline-block ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline-block ml-0.5" />
    )
  }

  const columns: { key: SortKey; label: string; align: string }[] = [
    { key: 'ticker', label: 'Ticker', align: 'text-left' },
    { key: 'last', label: 'Last', align: 'text-right' },
    { key: 'changePct', label: 'Chg %', align: 'text-right' },
    { key: 'volume', label: 'Volume', align: 'text-right' },
  ]

  return (
    <div className="flex flex-col">
      {/* Tab row */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-dash-border shrink-0">
        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-white/10 text-dash-text border border-dash-border">
          Main
        </span>
        <span className="px-2 py-0.5 text-[10px] font-mono text-dash-muted cursor-pointer hover:text-dash-text">
          +
        </span>
        {loading && (
          <span className="ml-auto text-[9px] font-mono text-dash-muted animate-pulse">LOADING</span>
        )}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_70px_70px] px-2 py-1 border-b border-dash-border bg-dash-panel-header shrink-0">
        {columns.map((col) => (
          <button
            key={col.key}
            onClick={() => handleSort(col.key)}
            className={`text-[10px] font-mono uppercase tracking-wider text-dash-muted hover:text-dash-text transition-colors cursor-pointer ${col.align}`}
          >
            {col.label}
            <SortArrow column={col.key} />
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="overflow-y-auto">
        {sorted.map((row) => {
          const changeColor =
            row.changePct > 0
              ? 'text-dash-green'
              : row.changePct < 0
                ? 'text-dash-red'
                : 'text-dash-muted'

          return (
            <button
              key={row.ticker}
              onClick={() => onTickerChange?.(row.ticker)}
              className="grid grid-cols-[1fr_80px_70px_70px] w-full px-2 h-7 items-center transition-colors cursor-pointer hover:bg-white/[0.03]"
            >
              <span className="text-xs font-mono font-bold text-dash-text text-left truncate">
                {row.ticker} <span className="font-normal text-dash-muted">US</span>
              </span>
              <span className="text-xs font-mono text-dash-text text-right">
                {row.last > 0 ? fmtPrice(row.last) : '—'}
              </span>
              <span className={`text-xs font-mono text-right ${changeColor}`}>
                {row.last > 0 ? fmtChange(row.changePct) : '—'}
              </span>
              <span className="text-xs font-mono text-dash-muted text-right">
                {row.volume > 0 ? fmtVolume(row.volume) : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bottom input */}
      <div className="border-t border-dash-border px-2 py-1.5 shrink-0">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
          placeholder="Add a new ticker"
          className="w-full px-2 py-1 text-xs font-mono bg-white/[0.03] border border-dash-border text-dash-text placeholder:text-dash-muted/50 focus:outline-none focus:border-accent-blue"
        />
      </div>
    </div>
  )
}

registerWidget({
  type: 'quote-monitor',
  name: 'Quote Monitor',
  description: 'Bloomberg-style watchlist with live quotes',
  icon: 'BarChart3',
  category: 'market',
  defaultConfig: { watchlist: DEFAULT_WATCHLIST },
  defaultLayout: { w: 480, h: 200 },
  component: QuoteMonitorWidget,
})
