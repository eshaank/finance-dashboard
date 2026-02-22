import { useInsideDays } from '../../hooks/useInsideDays'
import { InsideDayChart } from './InsideDayChart'
import { InsideDayStats } from './InsideDayStats'

interface Props {
  ticker: string
}

export function BulkScanDetail({ ticker }: Props) {
  const { data, loading, error } = useInsideDays(ticker)

  if (loading) {
    return (
      <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full" />
          Loading {ticker} details...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 md:gap-6">
        <div>
          {data.bars.length > 0 && (
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
        <InsideDayStats data={data} />
      </div>
    </div>
  )
}
