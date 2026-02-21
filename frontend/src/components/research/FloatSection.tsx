import { FundamentalsTable } from './FundamentalsTable'
import { TableRowSkeleton } from '../ui/Skeleton'

interface FloatSectionProps {
  data: unknown
  loading: boolean
  error: string | null
}

export function FloatSection({ data, loading, error }: FloatSectionProps) {
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-fade">
      <span className="text-xs uppercase tracking-widest text-white/30">Float Summary</span>
      <div className="mt-4">
        {loading ? <TableRowSkeleton rows={2} /> : null}
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        {data && !loading ? (
          <FundamentalsTable tab="float" data={data} />
        ) : null}
      </div>
    </div>
  )
}
