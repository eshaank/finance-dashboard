import { useState } from 'react'
import { useInsideDays } from '../../hooks/useInsideDays'
import { InsideDayChart } from './InsideDayChart'

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
    <div className="glass-card p-3 md:p-6">
      <h2 className="font-display text-lg font-semibold text-white mb-4">Inside Day Scanner</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6 max-w-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter ticker (e.g. IWM)"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Scanning…' : 'Scan'}
        </button>
      </form>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 md:gap-6">
        {/* Chart column */}
        <div>
          {loading && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full" />
              Fetching candles…
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {data && !loading && data.bars.length > 0 && (
            <div>
              <span className="text-white/40 uppercase tracking-wider text-xs">
                Last {data.bars.length} bars
              </span>
              <div className="mt-2 rounded-lg overflow-hidden bg-white/[0.02] p-2">
                <InsideDayChart
                  bars={data.bars}
                  motherBarDate={data.mother_bar_date}
                  insideDayDates={data.inside_day_dates}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-xs text-white/30 font-mono">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[#d29922]" /> Mother bar
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[#3fb950]" /> Inside day
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats sidebar */}
        {data && !loading && (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-display font-bold text-white">
                {data.consecutive_inside_days}
              </span>
              <span className="text-white/50 text-sm">
                consecutive inside {data.consecutive_inside_days === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="text-sm text-white/60">
              <span className="text-white/40 uppercase tracking-wider text-xs">Latest close</span>
              <p className="text-white font-medium mt-0.5">${data.latest_close.toFixed(2)}</p>
            </div>

            {data.mother_bar_date && (
              <div className="text-sm text-white/60">
                <span className="text-white/40 uppercase tracking-wider text-xs">Mother bar</span>
                <p className="text-white font-medium mt-0.5">{data.mother_bar_date}</p>
              </div>
            )}

            {data.inside_day_dates.length > 0 && (
              <div className="text-sm">
                <span className="text-white/40 uppercase tracking-wider text-xs">Streak dates</span>
                <ul className="mt-1.5 space-y-1">
                  {data.inside_day_dates.map((date) => (
                    <li key={date} className="text-white/70 font-mono text-xs">
                      {date}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.compression_pct !== null && data.consecutive_inside_days > 0 && (
              <div className="text-sm">
                <span className="text-white/40 uppercase tracking-wider text-xs">Compression</span>
                <div className="mt-2 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        data.compression_pct < 40
                          ? 'bg-dash-green'
                          : data.compression_pct < 70
                          ? 'bg-amber-400'
                          : 'bg-white/40'
                      }`}
                      style={{ width: `${data.compression_pct}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-xs font-mono">
                    {data.compression_pct}% of mother bar
                    {data.compression_pct < 40 && (
                      <span className="ml-2 text-dash-green">· Tight coil</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {data.consecutive_inside_days === 0 && (
              <p className="text-white/50 text-sm">
                No consecutive inside days detected for {data.ticker}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
