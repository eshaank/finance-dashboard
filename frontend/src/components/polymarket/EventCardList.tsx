import type { PolymarketEvent } from '../../types'
import { EventCard } from './EventCard'

interface EventCardListProps {
  events: PolymarketEvent[]
  loading: boolean
  error: string | null
}

export function EventCardList({ events, loading, error }: EventCardListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-3 h-[140px] animate-pulse bg-white/[0.04]" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-dash-red">Failed to load markets</p>
        <p className="text-[10px] text-dash-muted mt-1">{error}</p>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs text-dash-muted">No markets found</p>
        <p className="text-[10px] text-dash-muted/60 mt-1">Try a different category or search</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
