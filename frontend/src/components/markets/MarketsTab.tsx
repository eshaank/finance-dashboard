import { BarChart3 } from 'lucide-react'

export function MarketsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <BarChart3 className="w-7 h-7 text-accent" />
      </div>
      <h2 className="text-xl font-semibold text-dash-text mb-2">Markets</h2>
      <p className="text-sm text-white/40 max-w-md">
        Live market data, sector performance, and index tracking — coming soon.
      </p>
    </div>
  )
}
