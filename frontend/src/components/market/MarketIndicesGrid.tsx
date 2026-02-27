import { useMarketIndices } from '../../hooks/useMarketIndices'
import { MarketIndexCard } from './MarketIndexCard'

export function MarketIndicesGrid() {
  const { data, loading, error } = useMarketIndices()

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-1 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse border border-dash-border bg-dash-surface" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-dash-border bg-dash-surface p-4 text-sm text-dash-red">
        Failed to load market indices: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-1 xl:grid-cols-4">
      {data.map((index) => (
        <MarketIndexCard key={index.id} index={index} />
      ))}
    </div>
  )
}
