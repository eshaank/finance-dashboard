import { formatChange, formatPercent } from '../../lib/utils'
import { Badge } from './Badge'

interface ChangeBadgeProps {
  change: number
  changePercent: number
}

export function ChangeBadge({ change, changePercent }: ChangeBadgeProps) {
  const isPositive = change >= 0
  const variant = isPositive ? 'green' : 'red'

  return (
    <Badge variant={variant}>
      {formatChange(change)} ({formatPercent(changePercent)})
    </Badge>
  )
}
