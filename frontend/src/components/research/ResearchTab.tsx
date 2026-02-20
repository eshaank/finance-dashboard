import { useState } from 'react'
import type { FundamentalsTab } from '../../types'
import { useInsideDays } from '../../hooks/useInsideDays'
import { useFundamentals } from '../../hooks/useFundamentals'
import { useCompany } from '../../hooks/useCompany'
import { cn } from '../../lib/utils'
import { FundamentalsTable } from './FundamentalsTable'
import { CompanyHeader } from './CompanyHeader'
import { OverviewSection } from './OverviewSection'

type ResearchSection = 'overview' | 'financials' | 'short' | 'float'
type FinancialsSubTab = 'income-statement' | 'balance-sheet' | 'cash-flow'
type ShortSubTab = 'short-interest' | 'short-volume'
type Timeframe = 'annual' | 'quarterly'

const SECTIONS: { id: ResearchSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'short', label: 'Short Interest' },
  { id: 'float', label: 'Float' },
]

const FINANCIALS_TABS: { id: FinancialsSubTab; label: string }[] = [
  { id: 'income-statement', label: 'Income Statement' },
  { id: 'balance-sheet', label: 'Balance Sheet' },
  { id: 'cash-flow', label: 'Cash Flow' },
]

const SHORT_TABS: { id: ShortSubTab; label: string }[] = [
  { id: 'short-interest', label: 'Short Interest' },
  { id: 'short-volume', label: 'Short Volume' },
]

function getFundTab(
  section: ResearchSection,
  financialsTab: FinancialsSubTab,
  shortTab: ShortSubTab,
): FundamentalsTab {
  if (section === 'financials') return financialsTab
  if (section === 'short') return shortTab
  if (section === 'float') return 'float'
  return 'income-statement'
}

export function ResearchTab() {
  const [input, setInput] = useState('')
  const [activeTicker, setActiveTicker] = useState('')
  const [activeSection, setActiveSection] = useState<ResearchSection>('overview')
  const [financialsTab, setFinancialsTab] = useState<FinancialsSubTab>('income-statement')
  const [shortTab, setShortTab] = useState<ShortSubTab>('short-interest')
  const [timeframe, setTimeframe] = useState<Timeframe>('annual')

  const { data: priceData, loading: priceLoading } = useInsideDays(activeTicker || null)
  const { data: companyData, loading: companyLoading } = useCompany(activeTicker)

  const fundTab = getFundTab(activeSection, financialsTab, shortTab)
  const { data: fundData, loading: fundLoading, error: fundError } = useFundamentals(
    activeTicker && activeSection !== 'overview' ? activeTicker : '',
    fundTab,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim().toUpperCase()
    if (!trimmed) return
    setActiveTicker(trimmed)
    setActiveSection('overview')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Ticker header */}
      <CompanyHeader
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        ticker={activeTicker}
        company={companyData}
        priceData={priceData}
        loading={priceLoading}
      />

      {/* Placeholder */}
      {!activeTicker && (
        <div className="glass-card p-16 flex items-center justify-center text-white/30 text-sm">
          Enter a ticker above to load research data
        </div>
      )}

      {/* Row 2: Section tabs */}
      {activeTicker && (
        <div className="glass-card px-4 py-2 flex gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                activeSection === s.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Overview section */}
      {activeTicker && activeSection === 'overview' && (
        <OverviewSection
          ticker={activeTicker}
          priceData={priceData}
          priceLoading={priceLoading}
          company={companyData}
          companyLoading={companyLoading}
        />
      )}

      {/* Financials section */}
      {activeTicker && activeSection === 'financials' && (
        <div className="glass-card p-4 flex flex-col gap-4">
          {/* Sub-tabs + timeframe toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <nav className="flex gap-1">
              {FINANCIALS_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFinancialsTab(t.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                    financialsTab === t.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="flex gap-1">
              {(['annual', 'quarterly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors capitalize',
                    timeframe === tf
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70',
                  )}
                >
                  {tf === 'annual' ? 'Annual' : 'Quarterly'}
                </button>
              ))}
            </div>
          </div>

          {fundLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}
          {fundError && <p className="text-red-400 text-sm">{fundError}</p>}
          {fundData && !fundLoading && (
            <FundamentalsTable tab={financialsTab} data={fundData} timeframe={timeframe} />
          )}
        </div>
      )}

      {/* Short Interest section */}
      {activeTicker && activeSection === 'short' && (
        <div className="glass-card p-4 flex flex-col gap-4">
          <nav className="flex gap-1">
            {SHORT_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setShortTab(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                  shortTab === t.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {fundLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}
          {fundError && <p className="text-red-400 text-sm">{fundError}</p>}
          {fundData && !fundLoading && (
            <FundamentalsTable tab={shortTab} data={fundData} />
          )}
        </div>
      )}

      {/* Float section */}
      {activeTicker && activeSection === 'float' && (
        <div className="glass-card p-4">
          {fundLoading && (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}
          {fundError && <p className="text-red-400 text-sm">{fundError}</p>}
          {fundData && !fundLoading && (
            <FundamentalsTable tab="float" data={fundData} />
          )}
        </div>
      )}
    </div>
  )
}
