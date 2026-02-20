import { useUpcomingEvents } from '../../hooks/useUpcomingEvents'
import { EventItem } from './EventItem'

export function UpcomingEventsPanel() {
  const { data, loading, error } = useUpcomingEvents()

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="font-display text-base font-semibold text-dash-text">Upcoming Events</h2>
        <p className="text-xs text-white/40 mt-0.5">Economic calendar</p>
      </div>

      <div className="px-5">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="py-3 border-t border-white/5 first:border-t-0">
                <div className="h-4 animate-pulse rounded bg-white/5" />
                <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-white/5" />
              </div>
            ))
          : error
          ? <p className="py-4 text-sm text-dash-red">{error}</p>
          : data.map((event) => <EventItem key={event.id} event={event} />)}
      </div>
    </div>
  )
}
