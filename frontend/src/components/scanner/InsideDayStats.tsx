import type { InsideDayResult } from '../../types'

interface Props {
  data: InsideDayResult
}

export function InsideDayStats({ data }: Props) {
  return (
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
                style={{ width: `${Math.min(100, data.compression_pct)}%` }}
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
  )
}
