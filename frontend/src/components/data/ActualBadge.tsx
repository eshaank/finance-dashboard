import type { EconomicDataPoint } from '../../types'
import { Badge } from '../ui/Badge'

interface ActualBadgeProps {
  point: EconomicDataPoint
}

export function ActualBadge({ point }: ActualBadgeProps) {
  if (point.actual === null) {
    return <span className="text-xs text-dash-muted">Pending</span>
  }

  const variantMap: Record<EconomicDataPoint['status'], 'green' | 'red' | 'muted' | 'yellow'> = {
    beat: 'green',
    missed: 'red',
    inline: 'muted',
    pending: 'muted',
  }

  return (
    <Badge variant={variantMap[point.status]}>
      {point.actual.toLocaleString('en-US', { maximumFractionDigits: 2 })}{point.unit}
    </Badge>
  )
}
