import { useState } from 'react'
import { useInsideDays } from '../../hooks/useInsideDays'
import { InsideDayChart } from './InsideDayChart'
import { InsideDayStats } from './InsideDayStats'

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
        {data && !loading && <InsideDayStats data={data} />}
      </div>
    </div>
  )
}
