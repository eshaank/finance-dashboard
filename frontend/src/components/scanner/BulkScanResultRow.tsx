import type { BulkInsideDayItem } from '../../types'

interface Props {
  item: BulkInsideDayItem
  isExpanded: boolean
  onToggle: () => void
}

function formatMarketCap(cap: number | null): string {
  if (cap === null) return '\u2014'
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(0)}M`
  return cap.toLocaleString()
}

export function BulkScanResultRow({ item, isExpanded, onToggle }: Props) {
  return (
    <tr
      className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
      onClick={onToggle}
    >
      <td className="px-2 py-2 text-white/30 text-xs w-6">
        {isExpanded ? '\u25BE' : '\u25B8'}
      </td>
      <td className="px-3 py-2 font-bold text-white font-mono text-sm">
        {item.ticker}
      </td>
      <td className="px-3 py-2 text-white/60 text-sm truncate max-w-[200px]">
        {item.name ?? '\u2014'}
      </td>
      <td className="px-3 py-2">
        <span className={`text-lg font-bold ${item.consecutive_inside_days >= 3 ? 'text-dash-green' : 'text-white'}`}>
          {item.consecutive_inside_days}
        </span>
      </td>
      <td className="px-3 py-2">
        {item.compression_pct !== null ? (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  item.compression_pct < 40
                    ? 'bg-dash-green'
                    : item.compression_pct < 70
                    ? 'bg-amber-400'
                    : 'bg-white/40'
                }`}
                style={{ width: `${item.compression_pct}%` }}
              />
            </div>
            <span className="text-white/50 text-xs font-mono">{item.compression_pct}%</span>
          </div>
        ) : (
          <span className="text-white/30 text-xs">{'\u2014'}</span>
        )}
      </td>
      <td className="px-3 py-2 text-white font-mono text-sm">
        ${item.latest_close.toFixed(2)}
      </td>
      <td className="px-3 py-2 text-white/60 text-sm font-mono">
        {formatMarketCap(item.market_cap)}
      </td>
    </tr>
  )
}
