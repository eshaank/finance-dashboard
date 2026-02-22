import { useRecentData } from '../../hooks/useRecentData'
import { DataTableRow } from './DataTableRow'

export function RecentDataTable() {
  const { data, loading, error } = useRecentData()

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-white/5 px-3 py-3 sm:px-5 sm:py-4">
        <h2 className="font-display text-base font-semibold text-dash-text">Recent Economic Data</h2>
        <p className="text-xs text-white/40 mt-0.5">Latest releases vs forecasts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-3 sm:px-5 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-white/30">
                Indicator
              </th>
              <th className="py-2.5 pr-3 sm:pr-5 text-right text-[10px] font-medium uppercase tracking-widest text-white/30">
                Previous
              </th>
              <th className="py-2.5 pr-3 sm:pr-5 text-right text-[10px] font-medium uppercase tracking-widest text-white/30">
                Forecast
              </th>
              <th className="py-2.5 pr-3 sm:pr-5 text-right text-[10px] font-medium uppercase tracking-widest text-white/30">
                Actual
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td colSpan={4} className="py-3 px-5">
                      <div className="h-4 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              : error
              ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-5 text-sm text-dash-red">{error}</td>
                  </tr>
                )
              : data.map((point) => (
                  <DataTableRow key={point.id} point={point} />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
