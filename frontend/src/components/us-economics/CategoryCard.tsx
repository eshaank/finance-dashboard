import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { EconomicDataPoint } from '../../types'
import { Badge } from '../ui/Badge'

interface CategoryCardProps {
  label: string
  icon: LucideIcon
  points: EconomicDataPoint[]
}

function fmtNumber(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function fmt(val: number | null, unit: string): string {
  if (val === null) return '\u2014'
  return `${fmtNumber(val)}${unit}`
}

function changeValue(point: EconomicDataPoint): string {
  if (point.actual === null || point.previous === null) return '\u2014'
  const diff = point.actual - point.previous
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${fmtNumber(parseFloat(diff.toFixed(2)))}`
}

function directionArrow(point: EconomicDataPoint): { arrow: string; color: string } {
  if (point.actual === null || point.previous === null) {
    return { arrow: '', color: 'text-white/40' }
  }
  if (point.actual > point.previous) {
    return { arrow: '\u25B2', color: 'text-dash-green' }
  }
  if (point.actual < point.previous) {
    return { arrow: '\u25BC', color: 'text-dash-red' }
  }
  return { arrow: '\u2500', color: 'text-white/40' }
}

function statusVariant(status: EconomicDataPoint['status']): 'green' | 'red' | 'muted' {
  if (status === 'beat') return 'green'
  if (status === 'missed') return 'red'
  return 'muted'
}

export function CategoryCard({ label, icon: Icon, points }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (points.length === 0) return null

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.025] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/50" />
          <span className="font-display text-sm font-semibold text-dash-text">{label}</span>
          <span className="text-xs text-white/30">{points.length}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-white/30" />
          : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      <div className="px-4 pb-3 space-y-1">
        {points.map((point) => {
          const { arrow, color } = directionArrow(point)
          return (
            <div key={point.id} className="flex items-center justify-between gap-2 py-1">
              <span className="text-xs text-white/60 truncate flex-1">{point.indicator}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-sm text-dash-text">
                  {fmt(point.actual, point.unit)}
                </span>
                {arrow && (
                  <span className={`text-[10px] ${color}`}>{arrow}</span>
                )}
                <Badge variant={statusVariant(point.status)} className="text-[10px] w-14 justify-center">
                  {point.status}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-white/30">
                <th className="text-left pb-2 font-medium">Indicator</th>
                <th className="text-right pb-2 font-medium">Previous</th>
                <th className="text-right pb-2 font-medium">Actual</th>
                <th className="text-right pb-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id} className="border-t border-white/5">
                  <td className="py-2 text-white/60">{point.indicator}</td>
                  <td className="py-2 text-right font-mono text-white/40">
                    {fmt(point.previous, point.unit)}
                  </td>
                  <td className="py-2 text-right font-mono text-dash-text">
                    {fmt(point.actual, point.unit)}
                  </td>
                  <td className="py-2 text-right font-mono">
                    <span className={directionArrow(point).color}>
                      {changeValue(point)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
