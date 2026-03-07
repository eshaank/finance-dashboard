import { useState, useMemo } from 'react'
import { usePolymarketEvents } from '../../hooks/usePolymarketEvents'
import { usePolymarketStats } from '../../hooks/usePolymarketStats'
import { CategoryFilter } from './CategoryFilter'
import { TrendingMarkets } from './TrendingMarkets'
import { EventCardList } from './EventCardList'
import { MarketStatsPanel } from './MarketStatsPanel'

export function PolymarketTab() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { events, trending, loading, error } = usePolymarketEvents(activeCategory)
  const { data: stats, loading: statsLoading } = usePolymarketStats()

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events
    const q = searchQuery.toLowerCase()
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.markets.some((m) => m.question.toLowerCase().includes(q)),
    )
  }, [events, searchQuery])

  return (
    <div className="px-1.5 md:px-3">
      <div className="mb-3">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <TrendingMarkets events={trending} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
        <div className="lg:col-span-3">
          <EventCardList events={filteredEvents} loading={loading} error={error} />
        </div>
        <div className="lg:col-span-2">
          <MarketStatsPanel
            stats={stats}
            loading={statsLoading}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>
    </div>
  )
}
