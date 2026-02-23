import { useInsideDays } from '../../hooks/useInsideDays'
import { InsideDayChart } from './InsideDayChart'
import type { BulkInsideDayItem, InsideDayResult } from '../../types'

interface Props {
  ticker: string | null
  selectedItem?: BulkInsideDayItem | null
  onClose: () => void
}

function StatBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="block text-[9px] uppercase tracking-[0.1em] text-dash-muted/60 font-medium mb-1">
        {label}
      </span>
      {children}
    </div>
  )
}

function StatsGrid({ data }: { data: InsideDayResult }) {
  const compressionColor =
    data.compression_pct !== null && data.compression_pct < 40
      ? 'text-dash-green'
      : data.compression_pct !== null && data.compression_pct < 70
        ? 'text-dash-yellow'
        : 'text-dash-muted'

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatBlock label="Consecutive Days">
        <span className={`text-lg font-bold font-mono ${
          data.consecutive_inside_days >= 3 ? 'text-dash-green' : 'text-dash-text'
        }`}>
          {data.consecutive_inside_days}
        </span>
      </StatBlock>

      <StatBlock label="Compression">
        {data.compression_pct !== null ? (
          <div>
            <span className={`text-lg font-bold font-mono ${compressionColor}`}>
              {data.compression_pct.toFixed(1)}%
            </span>
            <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
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
      </StatBlock>

      <StatBlock label="Mother Bar">
        <span className="text-sm font-mono text-dash-yellow">
          {data.mother_bar_date ?? '\u2014'}
        </span>
      </StatBlock>

      <StatBlock label="Latest Close">
        <span className="text-sm font-mono text-dash-text font-semibold">
          ${data.latest_close.toFixed(2)}
        </span>
      </StatBlock>

      {data.inside_day_dates.length > 0 && (
        <div className="col-span-2">
          <StatBlock label="Inside Day Dates">
            <div className="flex flex-wrap gap-1.5">
              {data.inside_day_dates.map((date) => (
                <span
                  key={date}
                  className="px-2 py-0.5 rounded bg-dash-green/8 text-dash-green text-[11px] font-mono"
                >
                  {date}
                </span>
              ))}
            </div>
          </StatBlock>
        </div>
      )}
    </div>
  )
}


function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
          <path d="M3 3v18h18" />
          <path d="M7 12l4-4 4 4 4-4" />
        </svg>
      </div>
      <p className="text-dash-muted/50 text-sm font-medium mb-1">No ticker selected</p>
      <p className="text-dash-muted/30 text-xs max-w-[180px] leading-relaxed">
        Select a row from the results to view chart and analysis
      </p>
    </div>
  )
}

function LoadingState({ ticker }: { ticker: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 py-16">
      <div className="w-6 h-6 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
      <span className="text-dash-muted/50 text-sm">
        Loading <span className="font-mono font-semibold text-dash-text">{ticker}</span>
      </span>
    </div>
  )
}

export function ScannerDetailPanel({ ticker, selectedItem, onClose }: Props) {
  const { data, loading, error } = useInsideDays(ticker)

  if (!ticker) {
    return (
      <div className="glass-card h-full min-h-[400px]">
        <EmptyState />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card h-full min-h-[400px]">
        <LoadingState ticker={ticker} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card h-full min-h-[400px] flex items-center justify-center px-6">
        <p className="text-dash-red text-sm">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const displayName = selectedItem?.name ?? data.ticker

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden animate-slide-fade">
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-white/[0.04]">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h2 className="font-mono text-base font-bold text-dash-text tracking-tight">
            {data.ticker}
          </h2>
          {displayName !== data.ticker && (
            <span className="text-dash-muted/50 text-xs truncate">{displayName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className="font-mono text-sm font-semibold text-dash-text tabular-nums">
            ${data.latest_close.toFixed(2)}
          </span>
          {data.consecutive_inside_days > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-dash-green/10 text-dash-green text-[11px] font-bold font-mono">
              {data.consecutive_inside_days}ID
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-1 p-1 rounded hover:bg-white/5 transition-colors text-dash-muted/50 hover:text-dash-text"
            aria-label="Close detail panel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {data.bars.length > 0 ? (
          <div className="flex-1 min-h-[280px] rounded-lg overflow-hidden bg-white/[0.01] border border-white/[0.03]">
            <InsideDayChart
              bars={data.bars}
              motherBarDate={data.mother_bar_date}
              insideDayDates={data.inside_day_dates}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-dash-muted/30 text-sm rounded-lg bg-white/[0.01]">
            No bar data available
          </div>
        )}

        <div className="shrink-0 border-t border-white/[0.04] px-4 py-3 overflow-y-auto max-h-[200px]">
          {data.consecutive_inside_days > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-dash-muted/60 font-mono">Pattern detected</span>
              <span className="px-2 py-0.5 rounded bg-dash-green/10 text-dash-green text-[10px] font-bold font-mono">
                {data.consecutive_inside_days} inside day{data.consecutive_inside_days > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <StatsGrid data={data} />
        </div>


      </div>
    </div>
  )
}