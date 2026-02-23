import type { BulkInsideDayItem } from '../../types'

interface Props {
  item: BulkInsideDayItem
  isSelected: boolean
  onSelect: () => void
}

function formatMarketCap(cap: number | null): string {
  if (cap === null) return '\u2014'
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(0)}M`
  return cap.toLocaleString()
}

function formatVolume(vol: number | null): string {
  if (vol === null) return '\u2014'
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
  return vol.toLocaleString()
}

function compressionColor(pct: number): string {
  if (pct < 40) return 'bg-dash-green'
  if (pct < 70) return 'bg-dash-yellow'
  return 'bg-dash-muted/40'
}

export function BulkScanResultRow({ item, isSelected, onSelect }: Props) {
  return (
    <tr
      onClick={onSelect}
      className={`
        group cursor-pointer transition-colors duration-150
        ${isSelected
          ? 'bg-accent/8'
          : 'hover:bg-white/[0.02]'
        }
      `}
    >

      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-0.5 h-7 rounded-full transition-colors duration-150 ${
              isSelected ? 'bg-accent' : 'bg-transparent group-hover:bg-white/10'
            }`}
          />
          <div className="min-w-0">
            <span className="block font-mono text-[13px] font-semibold text-dash-text leading-tight">
              {item.ticker}
            </span>
            {item.name && (
              <span className="block text-[10px] text-dash-muted/70 truncate max-w-[140px] leading-tight mt-0.5">
                {item.name}
              </span>
            )}
          </div>
        </div>
      </td>


      <td className="px-3 py-3 text-center">
        <span
          className={`
            inline-flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold
            ${item.consecutive_inside_days >= 3
              ? 'bg-dash-green/12 text-dash-green'
              : item.consecutive_inside_days >= 2
                ? 'bg-dash-yellow/12 text-dash-yellow'
                : 'bg-white/5 text-dash-text'
            }
          `}
        >
          {item.consecutive_inside_days}
        </span>
      </td>


      <td className="px-3 py-3">
        {item.compression_pct !== null ? (
          <div className="flex items-center gap-2">
            <div className="w-14 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${compressionColor(item.compression_pct)}`}
                style={{ width: `${Math.min(100, item.compression_pct)}%` }}
              />
            </div>
            <span className="text-dash-muted text-[11px] font-mono tabular-nums">
              {item.compression_pct.toFixed(0)}%
            </span>
          </div>
        ) : (
          <span className="text-white/20 text-xs">{'\u2014'}</span>
        )}
      </td>


      <td className="px-3 py-3 text-right">
        <span className="font-mono text-[13px] text-dash-text tabular-nums">
          ${item.latest_close.toFixed(2)}
        </span>
      </td>


      <td className="px-3 py-3 text-right hidden md:table-cell">
        <span className="font-mono text-[12px] text-dash-muted tabular-nums">
          {formatMarketCap(item.market_cap)}
        </span>
      </td>


      <td className="px-3 py-3 text-right hidden lg:table-cell">
        <span className="font-mono text-[12px] text-dash-muted tabular-nums">
          {formatVolume(item.avg_volume)}
        </span>
      </td>


      <td className="px-3 py-3 text-right hidden xl:table-cell">
        <span className={`font-mono text-[12px] tabular-nums ${
          item.relative_volume !== null && item.relative_volume >= 1.5
            ? 'text-dash-green'
            : 'text-dash-muted'
        }`}>
          {item.relative_volume !== null ? `${item.relative_volume.toFixed(2)}x` : '\u2014'}
        </span>
      </td>


      <td className="px-3 py-3 text-right hidden xl:table-cell">
        <span className="font-mono text-[12px] text-dash-muted tabular-nums">
          {item.atr_pct !== null ? `${item.atr_pct.toFixed(1)}%` : '\u2014'}
        </span>
      </td>
    </tr>
  )
}
