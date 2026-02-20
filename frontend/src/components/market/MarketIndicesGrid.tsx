import { useMarketIndices } from '../../hooks/useMarketIndices'
import { MarketIndexCard } from './MarketIndexCard'

export function MarketIndicesGrid() {
  const { data, loading, error } = useMarketIndices()

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl glass-card" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-4 text-sm text-dash-red">
        Failed to load market indices: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {data.map((index) => (
        <MarketIndexCard key={index.id} index={index} />
      ))}
    </div>
  )
}
