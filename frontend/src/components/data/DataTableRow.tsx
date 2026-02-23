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
      <td className="py-3 px-3 sm:px-5 pr-4">
        <div className="font-medium text-dash-text">{point.indicator}</div>
        <div className="text-xs text-white/35 mt-0.5">{point.country}</div>
      </td>
      <td className="py-3 pr-3 sm:pr-5 font-mono text-white/40 text-right">
        {fmt(point.previous, point.unit)}
      </td>
      <td className="py-3 pr-3 sm:pr-5 font-mono text-white/40 text-right">
        {fmt(point.forecast, point.unit)}
      </td>
      <td className="py-3 pr-3 sm:pr-5 text-right">
        <ActualBadge point={point} />
      </td>
    </tr>
  )
}
