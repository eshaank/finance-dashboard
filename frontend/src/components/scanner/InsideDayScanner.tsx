import { useState } from 'react'
import { useInsideDays } from '../../hooks/useInsideDays'
import { InsideDayChart } from './InsideDayChart'
import type { InsideDayResult } from '../../types'

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="block text-[9px] uppercase tracking-[0.1em] text-dash-muted/50 font-medium mb-1">
        {label}
      </span>
      {children}
    </div>
  )
}

function ResultDisplay({ data }: { data: InsideDayResult }) {
  const compressionColor =
    data.compression_pct !== null && data.compression_pct < 40
      ? 'text-dash-green'
      : data.compression_pct !== null && data.compression_pct < 70
        ? 'text-dash-yellow'
        : 'text-dash-muted'

  return (
    <div className="space-y-4 animate-slide-fade">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h3 className="font-mono text-lg font-bold text-dash-text">{data.ticker}</h3>
          <span className="font-mono text-sm text-dash-muted tabular-nums">
            ${data.latest_close.toFixed(2)}
          </span>
        </div>
        {data.consecutive_inside_days > 0 && (
          <span className="px-2 py-0.5 rounded bg-dash-green/10 text-dash-green text-xs font-bold font-mono">
            {data.consecutive_inside_days} Inside {data.consecutive_inside_days === 1 ? 'Day' : 'Days'}
          </span>
        )}
      </div>

      {data.bars.length > 0 && (
        <div>
          <div className="h-[380px] rounded-lg overflow-hidden bg-white/[0.01] border border-white/[0.03]">
            <InsideDayChart
              bars={data.bars}
              motherBarDate={data.mother_bar_date}
              insideDayDates={data.inside_day_dates}
            />
          </div>
          <div className="mt-2 flex items-center gap-4 text-[10px] text-dash-muted/50 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm bg-dash-yellow" />
              Mother bar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm bg-dash-green" />
              Inside day
            </span>
            <span className="ml-auto text-dash-muted/30">
              Last {data.bars.length} bars
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="Consecutive Days">
          <span className={`text-xl font-bold font-mono ${
            data.consecutive_inside_days >= 3 ? 'text-dash-green' : 'text-dash-text'
          }`}>
            {data.consecutive_inside_days}
          </span>
        </StatCard>

        <StatCard label="Compression">
          {data.compression_pct !== null ? (
            <div>
              <span className={`text-xl font-bold font-mono ${compressionColor}`}>
                {data.compression_pct.toFixed(1)}%
              </span>
              <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    data.compression_pct < 40
                      ? 'bg-dash-green'
                      : data.compression_pct < 70
                        ? 'bg-dash-yellow'
                        : 'bg-dash-muted/40'
                  }`}
                  style={{ width: `${Math.min(100, data.compression_pct)}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-dash-muted text-sm">{'\u2014'}</span>
          )}
        </StatCard>

        <StatCard label="Mother Bar">
          <span className="text-sm font-mono text-dash-yellow">
            {data.mother_bar_date ?? '\u2014'}
          </span>
        </StatCard>

        <StatCard label="Latest Close">
          <span className="text-sm font-mono text-dash-text font-semibold">
            ${data.latest_close.toFixed(2)}
          </span>
        </StatCard>
      </div>

      {data.inside_day_dates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.1em] text-dash-muted/40 font-medium mr-1 self-center">
            Dates:
          </span>
          {data.inside_day_dates.map((date) => (
            <span
              key={date}
              className="px-2 py-0.5 rounded bg-dash-green/8 text-dash-green text-[11px] font-mono"
            >
              {date}
            </span>
          ))}
        </div>
      )}

      {data.consecutive_inside_days === 0 && (
        <div className="text-center py-6">
          <p className="text-dash-muted/40 text-sm">
            No consecutive inside days detected for <span className="font-mono font-semibold text-dash-text">{data.ticker}</span>.
          </p>
        </div>
      )}
    </div>
  )
}

export function InsideDayScanner() {
  const [input, setInput] = useState('')
  const [activeTicker, setActiveTicker] = useState<string | null>(null)
  const { data, loading, error } = useInsideDays(activeTicker)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setActiveTicker(trimmed.toUpperCase())
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter ticker (e.g. IWM)"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3.5 py-2 text-dash-text text-sm font-mono placeholder-dash-muted/30 focus:outline-none focus:border-accent/40 focus:bg-white/[0.04] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-[1.5px] border-white/20 border-t-white/70 rounded-full animate-spin" />
                Scanning
              </>
            ) : (
              'Scan'
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="glass-card p-8 flex items-center justify-center gap-3">
          <span className="w-5 h-5 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
          <span className="text-dash-muted/50 text-sm">
            Fetching <span className="font-mono font-semibold text-dash-text">{activeTicker}</span> data...
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="glass-card p-4">
          <p className="text-dash-red text-sm">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="glass-card p-4 md:p-5">
          <ResultDisplay data={data} />
        </div>
      )}
    </div>
  )
}
