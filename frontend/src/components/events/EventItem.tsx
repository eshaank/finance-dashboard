import type { UpcomingEvent } from '../../types'
import { Badge } from '../ui/Badge'
import { Calendar } from 'lucide-react'

interface EventItemProps {
  event: UpcomingEvent
}

function priorityVariant(p: UpcomingEvent['priority']): 'red' | 'yellow' | 'muted' {
  if (p === 'HIGH') return 'red'
  if (p === 'MEDIUM') return 'yellow'
  return 'muted'
}

function daysLabel(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days}d`
}

export function EventItem({ event }: EventItemProps) {
  const time = new Date(event.datetime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-t border-white/5 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-dash-text leading-snug">{event.name}</div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/35">
          <Calendar className="w-3 h-3" />
          <span>{daysLabel(event.daysUntil)} · {time} UTC</span>
        </div>
      </div>
      <Badge variant={priorityVariant(event.priority)} className="shrink-0 mt-0.5">
        {event.priority}
      </Badge>
    </div>
  )
}
