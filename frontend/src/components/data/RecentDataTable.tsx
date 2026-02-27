import { useRecentData } from '../../hooks/useRecentData'
import { DataTableRow } from './DataTableRow'

export function RecentDataTable() {
  const { data, loading, error } = useRecentData()

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2.5">
        <h2 className="text-sm font-semibold text-dash-text">Recent Data</h2>
        <p className="text-[10px] text-white/30 mt-0.5">Latest releases</p>
      </div>

      <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-dash-surface z-10">
            <tr className="border-b border-white/5">
              <th className="px-3 py-1.5 text-left text-[9px] font-medium uppercase tracking-widest text-white/30">
                Indicator
              </th>
              <th className="py-1.5 pr-3 text-right text-[9px] font-medium uppercase tracking-widest text-white/30">
                Prev
              </th>
              <th className="py-1.5 pr-3 text-right text-[9px] font-medium uppercase tracking-widest text-white/30">
                Fcst
              </th>
              <th className="py-1.5 pr-3 text-right text-[9px] font-medium uppercase tracking-widest text-white/30">
                Actual
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td colSpan={4} className="py-2 px-3">
                      <div className="h-3 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              : error
              ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-xs text-dash-red">{error}</td>
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
