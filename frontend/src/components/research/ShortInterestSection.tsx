import { FundamentalsTable } from './FundamentalsTable'
import { SubTabNav } from './SubTabNav'
import { TableRowSkeleton } from '../ui/Skeleton'

type ShortSubTab = 'short-interest' | 'short-volume'

const SHORT_TABS: { id: ShortSubTab; label: string }[] = [
  { id: 'short-interest', label: 'Short Interest' },
  { id: 'short-volume', label: 'Short Volume' },
]

interface ShortInterestSectionProps {
  shortTab: ShortSubTab
  onShortTabChange: (tab: ShortSubTab) => void
  data: unknown
  loading: boolean
  error: string | null
}

export function ShortInterestSection({
  shortTab,
  onShortTabChange,
  data,
  loading,
  error,
}: ShortInterestSectionProps) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 animate-slide-fade">
      <span className="text-xs uppercase tracking-widest text-white/30">
        {SHORT_TABS.find((t) => t.id === shortTab)?.label ?? 'Short Interest'}
      </span>

      <SubTabNav
        tabs={SHORT_TABS}
        active={shortTab}
        onSelect={(id) => onShortTabChange(id as ShortSubTab)}
      />

      {loading ? <TableRowSkeleton rows={4} /> : null}
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      {data && !loading ? (
        <FundamentalsTable tab={shortTab} data={data} />
      ) : null}
    </div>
  )
}
