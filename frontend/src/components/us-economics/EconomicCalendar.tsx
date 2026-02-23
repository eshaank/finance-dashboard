import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import type { UpcomingEvent } from '../../types'

interface EconomicCalendarProps {
  events: UpcomingEvent[]
  loading: boolean
  error: string | null
}

/** Get Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function fmtShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDayHeader(date: Date): string {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${dayName}, ${monthDay}`
}

function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

const IMPACT_STYLES: Record<UpcomingEvent['priority'], { bar: string; bg: string; text: string }> = {
  HIGH:   { bar: 'bg-dash-red',    bg: 'bg-dash-red/10',    text: 'text-dash-red' },
  MEDIUM: { bar: 'bg-dash-yellow', bg: 'bg-dash-yellow/10', text: 'text-dash-yellow' },
  LOW:    { bar: 'bg-white/20',    bg: 'bg-white/5',        text: 'text-white/40' },
}

function fmtTime(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  }).toLowerCase()
}

function fmtValue(val: number | null, unit: string): string {
  if (val === null) return ''
  return `${val.toLocaleString('en-US', { maximumFractionDigits: 2 })}${unit}`
}

interface DayGroup {
  date: Date
  dateStr: string
  events: UpcomingEvent[]
}

const EVENT_TYPES = [
  { id: 'growth',       label: 'Growth' },
  { id: 'inflation',    label: 'Inflation' },
  { id: 'employment',   label: 'Employment' },
  { id: 'central_bank', label: 'Central Bank' },
  { id: 'bonds',        label: 'Bonds' },
  { id: 'housing',      label: 'Housing' },
  { id: 'consumer',     label: 'Consumer Surveys' },
  { id: 'business',     label: 'Business Surveys' },
  { id: 'speeches',     label: 'Speeches' },
  { id: 'other',        label: 'Misc' },
] as const

const ALL_TYPE_IDS = new Set(EVENT_TYPES.map((t) => t.id))

const COL_COUNT = 7

export function EconomicCalendar({ events, loading, error }: EconomicCalendarProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [weekOffset, setWeekOffset] = useState(0)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(ALL_TYPE_IDS))
  const [showFilters, setShowFilters] = useState(false)

  const weekStart = useMemo(() => addDays(getMonday(today), weekOffset * 7), [today, weekOffset])
  const weekEnd = addDays(weekStart, 6)

  const weekLabel = `${fmtShortDate(weekStart)} \u2013 ${fmtShortDate(weekEnd)}`

  const allSelected = activeFilters.size === ALL_TYPE_IDS.size
  const noneSelected = activeFilters.size === 0

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => setActiveFilters(new Set(ALL_TYPE_IDS)), [])
  const selectNone = useCallback(() => setActiveFilters(new Set()), [])

  const filteredEvents = useMemo(() => {
    if (allSelected) return events
    return events.filter((ev) => {
      const cat = ev.category || 'other'
      return activeFilters.has(cat)
    })
  }, [events, activeFilters, allSelected])

  const dayGroups: DayGroup[] = useMemo(() => {
    const groups: DayGroup[] = []

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      const dayEvents = filteredEvents.filter((ev) => {
        const evDateStr = ev.datetime.split('T')[0]
        return evDateStr === dateStr
      })

      groups.push({ date, dateStr, events: dayEvents })
    }

    return groups
  }, [filteredEvents, weekStart])

  const hasEvents = dayGroups.some((g) => g.events.length > 0)
  const filterCount = allSelected ? null : activeFilters.size

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Week header */}
      <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-base font-semibold text-dash-text">Economic Calendar</h2>
          {weekOffset === 0 && (
            <span className="text-[10px] uppercase tracking-wider font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              This Week
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors
              ${showFilters ? 'bg-white/10 text-dash-text' : 'hover:bg-white/5 text-white/40'}
            `}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {filterCount !== null && (
              <span className="bg-accent/20 text-accent text-[10px] font-semibold px-1 rounded">
                {filterCount}
              </span>
            )}
          </button>

          {/* Week nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4 text-white/40" />
            </button>
            <span className="text-sm text-dash-text font-medium min-w-[170px] text-center">
              {weekLabel}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="ml-1 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="border-b border-white/5 px-4 py-2.5 flex flex-wrap items-center gap-2">
          <button
            onClick={allSelected ? selectNone : selectAll}
            className="text-[11px] font-medium text-accent hover:text-accent/80 transition-colors mr-1"
          >
            {allSelected ? 'None' : 'All'}
          </button>
          {EVENT_TYPES.map((type) => {
            const isActive = activeFilters.has(type.id)
            return (
              <button
                key={type.id}
                onClick={() => toggleFilter(type.id)}
                className={`
                  px-2 py-1 rounded-md text-[11px] font-medium transition-colors
                  ${isActive
                    ? 'bg-white/10 text-dash-text'
                    : 'bg-transparent text-white/25 hover:text-white/40'}
                `}
              >
                {type.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider font-semibold text-white/50">
              <th scope="col" className="w-[100px] px-4 py-3 text-left">Date</th>
              <th scope="col" className="w-[72px] px-2 py-3 text-left">Time</th>
              <th scope="col" className="w-[48px] px-2 py-3 text-center">Impact</th>
              <th scope="col" className="px-3 py-3 text-left">Event</th>
              <th scope="col" className="w-[88px] px-3 py-3 text-right">Actual</th>
              <th scope="col" className="w-[88px] px-3 py-3 text-right">Forecast</th>
              <th scope="col" className="w-[88px] px-3 py-3 text-right">Previous</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={COL_COUNT} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-white/5 max-w-[300px]" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={COL_COUNT} className="px-4 py-4">
                  <p className="text-sm text-dash-red">{error}</p>
                </td>
              </tr>
            ) : !hasEvents ? (
              <tr>
                <td colSpan={COL_COUNT} className="px-4 py-8 text-center">
                  <p className="text-xs text-white/30">
                    {noneSelected ? 'No event types selected' : 'No events this week'}
                  </p>
                </td>
              </tr>
            ) : (
              dayGroups.map((group) => {
                const isToday = isSameDate(group.date, today)
                const rowBg = isToday ? 'bg-accent/[0.06]' : ''

                if (group.events.length === 0) {
                  return (
                    <tr key={group.dateStr} className={rowBg}>
                      <td className={`px-4 py-2.5 font-medium ${isToday ? 'text-accent' : 'text-white/40'}`}>
                        {fmtDayHeader(group.date)}
                      </td>
                      <td colSpan={COL_COUNT - 1} className="px-2 py-2.5 text-white/25 italic">
                        No releases
                      </td>
                    </tr>
                  )
                }

                return group.events.map((event, idx) => {
                  const impact = IMPACT_STYLES[event.priority]
                  return (
                    <tr
                      key={event.id}
                      className={`${rowBg} hover:bg-white/[0.02] transition-colors`}
                    >
                      {/* Date — first row only */}
                      <td className={`px-4 py-2.5 font-medium align-top ${isToday ? 'text-accent' : 'text-white/50'}`}>
                        {idx === 0 ? fmtDayHeader(group.date) : '\u00A0'}
                      </td>

                      {/* Time */}
                      <td className="px-2 py-2.5 font-mono text-white/40 align-top">
                        {fmtTime(event.datetime)}
                      </td>

                      {/* Impact bar */}
                      <td className="px-2 py-2.5 align-top text-center">
                        <span className={`inline-block w-1.5 h-4 rounded-full ${impact.bar}`} />
                      </td>

                      {/* Event name */}
                      <td className="px-3 py-2.5 align-top">
                        <span className="text-sm text-dash-text">{event.name}</span>
                      </td>

                      {/* Actual */}
                      <td className={`px-3 py-2.5 font-mono text-right align-top ${event.actual !== null ? 'text-dash-text' : 'text-white/20'}`}>
                        {fmtValue(event.actual, event.unit) || '\u2014'}
                      </td>

                      {/* Forecast */}
                      <td className="px-3 py-2.5 font-mono text-right align-top text-white/40">
                        {fmtValue(event.forecast, event.unit) || '\u2014'}
                      </td>

                      {/* Previous */}
                      <td className="px-3 py-2.5 font-mono text-right align-top text-white/40">
                        {fmtValue(event.previous, event.unit) || '\u2014'}
                      </td>
                    </tr>
                  )
                })
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
