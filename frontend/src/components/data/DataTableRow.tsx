import type { EconomicDataPoint } from '../../types'
import { ActualBadge } from './ActualBadge'

interface DataTableRowProps {
  point: EconomicDataPoint
}

function fmt(val: number | null, unit: string): string {
  if (val === null) return '—'
  return `${val.toLocaleString('en-US', { maximumFractionDigits: 2 })}${unit}`
}

export function DataTableRow({ point }: DataTableRowProps) {
  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.025] transition-colors">
      <td className="py-1.5 px-3">
        <div className="text-[11px] font-medium text-dash-text leading-tight">{point.indicator}</div>
      </td>
      <td className="py-1.5 pr-3 font-mono text-[10px] text-white/40 text-right">
        {fmt(point.previous, point.unit)}
      </td>
      <td className="py-1.5 pr-3 font-mono text-[10px] text-white/40 text-right">
        {fmt(point.forecast, point.unit)}
      </td>
      <td className="py-1.5 pr-3 text-right">
        <ActualBadge point={point} />
      </td>
    </tr>
  )
}
