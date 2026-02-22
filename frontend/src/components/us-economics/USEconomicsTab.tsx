import { useState, useMemo } from 'react'
import { Flame, Briefcase, TrendingUp, Landmark, Target, ShoppingCart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRecentData } from '../../hooks/useRecentData'
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents'
import type { EconomicDataPoint } from '../../types'
import { CategoryCard } from './CategoryCard'
import { EconomicCalendar } from './EconomicCalendar'

interface CategoryConfig {
  label: string
  icon: LucideIcon
  order: number
}

const CATEGORIES: Record<string, CategoryConfig> = {
  inflation:    { label: 'Inflation',              icon: Flame,        order: 0 },
  employment:   { label: 'Labor Market',           icon: Briefcase,    order: 1 },
  growth:       { label: 'Growth & Production',    icon: TrendingUp,   order: 2 },
  yields:       { label: 'Treasury Yields',        icon: Landmark,     order: 3 },
  expectations: { label: 'Inflation Expectations', icon: Target,       order: 4 },
  consumer:     { label: 'Consumer',               icon: ShoppingCart,  order: 5 },
}

type SubTab = 'indicators' | 'calendar'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'indicators', label: 'Indicators' },
  { id: 'calendar', label: 'Calendar' },
]

function groupByCategory(data: EconomicDataPoint[]) {
  const groups = new Map<string, EconomicDataPoint[]>()
  for (const point of data) {
    const key = point.category || 'other'
    const arr = groups.get(key) ?? []
    arr.push(point)
    groups.set(key, arr)
  }
  return groups
}

export function USEconomicsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('indicators')
  const { data, loading, error } = useRecentData()
  const { data: events, loading: eventsLoading, error: eventsError } = useUpcomingEvents()

  const categories = useMemo(() => groupByCategory(data), [data])

  const sortedCategories = useMemo(() => {
    return [...categories.entries()]
      .filter(([key]) => CATEGORIES[key])
      .sort(([a], [b]) => (CATEGORIES[a]?.order ?? 99) - (CATEGORIES[b]?.order ?? 99))
  }, [categories])

  const lastUpdated = data.length > 0
    ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="space-y-6">
      {/* Header + sub-tabs */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold text-dash-text">US Economics</h1>
          {lastUpdated && (
            <span className="text-xs text-white/30">Last updated {lastUpdated}</span>
          )}
        </div>
        <p className="text-xs text-white/40 mt-0.5">Live economic indicators from FRED & Massive</p>

        <div className="mt-4 flex gap-1 border-b border-white/5">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                relative px-3 py-2 text-sm font-medium transition-colors
                ${activeSubTab === tab.id
                  ? 'text-dash-text'
                  : 'text-white/40 hover:text-white/60'}
              `}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators view */}
      {activeSubTab === 'indicators' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 space-y-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-4 animate-pulse rounded bg-white/5" />
                    <div className="h-4 animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-dash-red">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedCategories.map(([key, points]) => {
                const config = CATEGORIES[key]
                return (
                  <CategoryCard
                    key={key}
                    label={config.label}
                    icon={config.icon}
                    points={points}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Calendar view */}
      {activeSubTab === 'calendar' && (
        <EconomicCalendar events={events} loading={eventsLoading} error={eventsError} />
      )}
    </div>
  )
}
