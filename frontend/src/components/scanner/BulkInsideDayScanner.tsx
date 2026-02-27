import { useState } from 'react'
import { useBulkInsideDays } from '../../hooks/useBulkInsideDays'
import { BulkScanResultRow } from './BulkScanResultRow'
import type { BulkInsideDayItem } from '../../types'

type Preset = 'all' | 'spy500' | 'nasdaq100'

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'all', label: 'All Stocks' },
  { id: 'spy500', label: 'S&P 500' },
  { id: 'nasdaq100', label: 'NASDAQ 100' },
]

function parseCapInput(raw: string): number | null {
  const s = raw.trim().replace(/,/g, '')
  if (!s) return null
  const match = s.match(/^([\d.]+)\s*([KMBTkmbt])?$/)
  if (!match) return null
  let n = parseFloat(match[1])
  if (Number.isNaN(n)) return null
  const suffix = (match[2] ?? '').toUpperCase()
  if (suffix === 'K') n *= 1e3
  else if (suffix === 'M') n *= 1e6
  else if (suffix === 'B') n *= 1e9
  else if (suffix === 'T') n *= 1e12
  return n
}

interface ScanParams {
  preset: string
  minCap?: number
  maxCap?: number
  minPrice?: number
  minAvgVolume?: number
  minRelativeVolume?: number
  minAtrPct?: number
  excludeEtfs?: boolean
}

interface Props {
  selectedTicker: string | null
  onTickerSelect: (ticker: string | null, item?: BulkInsideDayItem) => void
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  prefix?: string
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[9px] uppercase tracking-[0.1em] text-dash-muted/50 font-medium mb-1.5">
        {label}
      </span>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dash-muted/40 text-xs">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
            ${prefix ? 'pl-6' : 'pl-3'} pr-3 py-1.5
            text-dash-text text-xs font-mono placeholder-dash-muted/30
            focus:outline-none focus:border-accent/40 focus:bg-white/[0.04]
            transition-colors duration-150
          `}
        />
      </div>
    </div>
  )
}

export function BulkInsideDayScanner({ selectedTicker, onTickerSelect }: Props) {
  const [preset, setPreset] = useState<Preset>('all')
  const [minCap, setMinCap] = useState('')
  const [maxCap, setMaxCap] = useState('')
  const [minPrice, setMinPrice] = useState('10')
  const [minAvgVolume, setMinAvgVolume] = useState('500000')
  const [minRelativeVolume, setMinRelativeVolume] = useState('')
  const [minAtrPct, setMinAtrPct] = useState('')
  const [excludeEtfs, setExcludeEtfs] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [scanParams, setScanParams] = useState<ScanParams | null>(null)

  const { data, loading, error } = useBulkInsideDays(scanParams)

  function handleScan() {
    const params: ScanParams = { preset }
    const min = parseCapInput(minCap)
    const max = parseCapInput(maxCap)
    if (min != null) params.minCap = min
    if (max != null) params.maxCap = max
    const price = parseFloat(minPrice)
    if (!isNaN(price) && price > 0) params.minPrice = price
    const vol = parseFloat(minAvgVolume)
    if (!isNaN(vol) && vol > 0) params.minAvgVolume = vol
    const relVol = parseFloat(minRelativeVolume)
    if (!isNaN(relVol) && relVol > 0) params.minRelativeVolume = relVol
    const atr = parseFloat(minAtrPct)
    if (!isNaN(atr) && atr > 0) params.minAtrPct = atr
    params.excludeEtfs = excludeEtfs
    setScanParams(params)
    onTickerSelect(null)
  }

  function handleRowClick(item: BulkInsideDayItem) {
    const next = selectedTicker === item.ticker ? null : item.ticker
    onTickerSelect(next, next ? item : undefined)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleScan()
  }

  return (
    <div className="space-y-3">
      <div className="glass-card p-4" onKeyDown={handleKeyDown}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-0">
              <span className="block text-[9px] uppercase tracking-[0.1em] text-dash-muted/50 font-medium mb-1.5">
                Universe
              </span>
              <div className="flex gap-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      preset === p.id
                        ? 'bg-accent text-white shadow-sm shadow-accent/20'
                        : 'bg-white/[0.04] text-dash-muted/60 hover:text-dash-muted hover:bg-white/[0.06] border border-white/[0.05]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <FilterInput label="Min Cap" value={minCap} onChange={setMinCap} placeholder="1B" prefix="$" />
              <span className="text-dash-muted/30 text-xs pb-2">to</span>
              <FilterInput label="Max Cap" value={maxCap} onChange={setMaxCap} placeholder="100B" prefix="$" />
            </div>

            <FilterInput label="Min Price" value={minPrice} onChange={setMinPrice} placeholder="10" prefix="$" />
            <FilterInput label="Min Volume" value={minAvgVolume} onChange={setMinAvgVolume} placeholder="500K" />

            <div className="flex items-end gap-2 ml-auto">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-1.5 rounded-lg text-xs text-dash-muted/50 hover:text-dash-muted hover:bg-white/[0.04] transition-colors duration-150 border border-transparent hover:border-white/[0.05]"
              >
                <span className="flex items-center gap-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  More
                </span>
              </button>

              <button
                onClick={handleScan}
                disabled={loading}
                className="px-5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-[1.5px] border-white/20 border-t-white/70 rounded-full animate-spin" />
                    Scanning
                  </>
                ) : (
                  'Scan'
                )}
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="flex flex-wrap items-end gap-4 pt-3 border-t border-white/[0.04] animate-slide-fade">
              <FilterInput label="Min Rel Volume" value={minRelativeVolume} onChange={setMinRelativeVolume} placeholder="0.7" />
              <FilterInput label="Min ATR %" value={minAtrPct} onChange={setMinAtrPct} placeholder="3" />

              <div className="min-w-0">
                <span className="block text-[9px] uppercase tracking-[0.1em] text-dash-muted/50 font-medium mb-1.5">
                  Exclude ETFs
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeEtfs}
                    onChange={(e) => setExcludeEtfs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-[18px] bg-white/10 rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-[14px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/50 after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:after:bg-white transition-colors" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="px-1 py-2 text-dash-red text-xs">{error}</div>
      )}

      {loading && (
        <div className="glass-card p-3 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {data && !loading && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] text-dash-muted/50 font-mono tracking-wide">
              {data.total_scanned.toLocaleString()} scanned
              <span className="mx-1.5 text-white/10">|</span>
              <span className="text-dash-green/70">{data.total_with_inside_days}</span> with inside days
            </span>
            <span className="text-[10px] text-dash-muted/30 font-mono">
              {data.scan_date}
            </span>
          </div>

          {data.results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-dash-muted/40 text-sm">No inside days found with current filters.</p>
              <p className="text-dash-muted/25 text-xs mt-1">Try broadening your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-left px-4 py-2">Ticker</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-center px-3 py-2">Days</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-left px-3 py-2">Compr.</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-right px-3 py-2">Price</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-right px-3 py-2 hidden md:table-cell">Mkt Cap</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-right px-3 py-2 hidden lg:table-cell">Avg Vol</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-right px-3 py-2 hidden xl:table-cell">Rel Vol</th>
                    <th className="text-[9px] font-medium uppercase tracking-[0.12em] text-dash-muted/40 text-right px-3 py-2 hidden xl:table-cell">ATR%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {data.results.map((item) => (
                    <BulkScanResultRow
                      key={item.ticker}
                      item={item}
                      isSelected={selectedTicker === item.ticker}
                      onSelect={() => handleRowClick(item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
