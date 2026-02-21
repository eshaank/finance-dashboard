import { cn } from '../../lib/utils'
import { FundamentalsTable } from './FundamentalsTable'
import { SubTabNav } from './SubTabNav'
import { TableRowSkeleton } from '../ui/Skeleton'

type FinancialsSubTab = 'income-statement' | 'balance-sheet' | 'cash-flow'
type Timeframe = 'annual' | 'quarterly'

const FINANCIALS_TABS: { id: FinancialsSubTab; label: string }[] = [
  { id: 'income-statement', label: 'Income Statement' },
  { id: 'balance-sheet', label: 'Balance Sheet' },
  { id: 'cash-flow', label: 'Cash Flow' },
]

interface FinancialsSectionProps {
  financialsTab: FinancialsSubTab
  onFinancialsTabChange: (tab: FinancialsSubTab) => void
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
  data: unknown
  loading: boolean
  error: string | null
}

export function FinancialsSection({
  financialsTab,
  onFinancialsTabChange,
  timeframe,
  onTimeframeChange,
  data,
  loading,
  error,
}: FinancialsSectionProps) {
  const subLabel = FINANCIALS_TABS.find((t) => t.id === financialsTab)?.label ?? ''
  const timeframeLabel = timeframe === 'annual' ? 'Annual' : 'Quarterly'

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4 border border-white/[0.06] animate-slide-fade">
      <span className="text-xs uppercase tracking-widest text-white/30">
        {subLabel} — {timeframeLabel}
      </span>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <SubTabNav
          tabs={FINANCIALS_TABS}
          active={financialsTab}
          onSelect={(id) => onFinancialsTabChange(id as FinancialsSubTab)}
        />
        <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06]">
          {(['annual', 'quarterly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors capitalize rounded-md',
                timeframe === tf
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60',
              )}
            >
              {tf === 'annual' ? 'Annual' : 'Quarterly'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <TableRowSkeleton /> : null}
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      {data && !loading ? (
        <FundamentalsTable tab={financialsTab} data={data} timeframe={timeframe} />
      ) : null}
    </div>
  )
}
