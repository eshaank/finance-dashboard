import { useState, Fragment } from 'react'
import { useBulkInsideDays } from '../../hooks/useBulkInsideDays'
import { BulkScanResultRow } from './BulkScanResultRow'
import { BulkScanDetail } from './BulkScanDetail'

type Preset = 'all' | 'spy500' | 'nasdaq100'

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'all', label: 'All Stocks' },
  { id: 'spy500', label: 'S&P 500' },
  { id: 'nasdaq100', label: 'NASDAQ 100' },
]

/** Parse cap input: accepts numbers, commas, and K/M/B/T suffixes (e.g. "1B", "500M"). */
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

const CAP_SLIDER_STEPS: { value: number; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1e6, label: '1M' },
  { value: 10e6, label: '10M' },
  { value: 100e6, label: '100M' },
  { value: 1e9, label: '1B' },
  { value: 10e9, label: '10B' },
  { value: 100e9, label: '100B' },
]

function getSliderIndex(capStr: string): number {
  const num = parseCapInput(capStr)
  if (num === null) return 0
  let best = 0
  for (let i = 0; i < CAP_SLIDER_STEPS.length; i++) {
    if (CAP_SLIDER_STEPS[i].value <= num) best = i
  }
  return best
}

interface ScanParams {
  preset: string
  minCap?: number
  maxCap?: number
}

export function BulkInsideDayScanner() {
  const [preset, setPreset] = useState<Preset>('all')
  const [minCap, setMinCap] = useState('')
  const [maxCap, setMaxCap] = useState('')
  const [scanParams, setScanParams] = useState<ScanParams | null>(null)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)

  const { data, loading, error } = useBulkInsideDays(scanParams)

  function handleScan() {
    const params: ScanParams = { preset }
    const min = parseCapInput(minCap)
    const max = parseCapInput(maxCap)
    if (min != null) params.minCap = min
    if (max != null) params.maxCap = max
    setScanParams(params)
    setExpandedTicker(null)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass-card p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Universe */}
          <div>
            <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium">Universe</span>
            <div className="mt-2 flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    preset === p.id
                      ? 'bg-accent text-white'
                      : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Market Cap Filter */}
          <div className="min-w-0">
            <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium">Market Cap Filter</span>
            <div className="mt-2 flex gap-2 items-center">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                <input
                  type="text"
                  value={minCap}
                  onChange={(e) => setMinCap(e.target.value)}
                  placeholder="e.g. 1B"
                  className="w-28 bg-white/5 border border-white/10 rounded-lg pl-5 pr-3 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <span className="text-white/30 text-xs">to</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                <input
                  type="text"
                  value={maxCap}
                  onChange={(e) => setMaxCap(e.target.value)}
                  placeholder="e.g. 10B"
                  className="w-28 bg-white/5 border border-white/10 rounded-lg pl-5 pr-3 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            {/* Sliders: short notation M/B */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                  <span>Min</span>
                  <span className="font-mono">{CAP_SLIDER_STEPS[getSliderIndex(minCap)].label}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={CAP_SLIDER_STEPS.length - 1}
                  value={getSliderIndex(minCap)}
                  onChange={(e) => setMinCap(CAP_SLIDER_STEPS[Number(e.target.value)].label)}
                  className="w-full h-1.5 accent-accent bg-white/10 rounded appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                  <span>Max</span>
                  <span className="font-mono">{CAP_SLIDER_STEPS[getSliderIndex(maxCap)].label}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={CAP_SLIDER_STEPS.length - 1}
                  value={getSliderIndex(maxCap)}
                  onChange={(e) => setMaxCap(CAP_SLIDER_STEPS[Number(e.target.value)].label)}
                  className="w-full h-1.5 accent-accent bg-white/10 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-1.5 flex gap-1">
              {['1B', '10B', '100B'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setMinCap(chip)
                    setMaxCap(chip)
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 hover:text-white/50 cursor-pointer transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-opacity"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full" />
                Scanning...
              </>
            ) : (
              'Scan for Inside Days'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm px-1">{error}</p>}

      {/* Stats bar */}
      {data && !loading && (
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono px-1">
          Scanned {data.total_scanned} tickers · {data.total_with_inside_days} with inside days · as of {data.scan_date}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="glass-card p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && !loading && data.results.length === 0 && (
        <div className="glass-card p-8 text-center text-white/40 text-sm">
          No inside days found. Try adjusting your filters.
        </div>
      )}

      {/* Results table */}
      {data && !loading && data.results.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-6" />
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Ticker</th>
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Name</th>
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Days</th>
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Compression</th>
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Close</th>
                <th className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-left px-3 py-2">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((item) => (
                <Fragment key={item.ticker}>
                  <BulkScanResultRow
                    item={item}
                    isExpanded={expandedTicker === item.ticker}
                    onToggle={() => setExpandedTicker(expandedTicker === item.ticker ? null : item.ticker)}
                  />
                  {expandedTicker === item.ticker && (
                    <tr>
                      <td colSpan={7}>
                        <BulkScanDetail ticker={item.ticker} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
