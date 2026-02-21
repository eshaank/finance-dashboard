import { useState } from 'react'
import type { ChartTimeframe, FundamentalsTab } from '../../types'
import { useInsideDays } from '../../hooks/useInsideDays'
import { usePriceChart } from '../../hooks/usePriceChart'
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

function SubTabNav({ tabs, active, onSelect }: {
  tabs: { id: string; label: string }[]
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="flex gap-0 border-b border-white/[0.06]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            'px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors relative',
            active === t.id
              ? 'text-white'
              : 'text-white/40 hover:text-white/60',
          )}
        >
          {t.label}
          {active === t.id && (
            <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-accent rounded-full" />
          )}
        </button>
      ))}
    </nav>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-widest text-white/30">{children}</span>
  )
}

export function ResearchTab() {
  const [input, setInput] = useState('')
  const [activeTicker, setActiveTicker] = useState('')
  const [activeSection, setActiveSection] = useState<ResearchSection>('overview')
  const [financialsTab, setFinancialsTab] = useState<FinancialsSubTab>('income-statement')
  const [shortTab, setShortTab] = useState<ShortSubTab>('short-interest')
  const [timeframe, setTimeframe] = useState<Timeframe>('annual')
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M')

  const { data: priceData, loading: priceLoading } = useInsideDays(activeTicker || null)
  const { data: chartData, loading: chartLoading } = usePriceChart(activeTicker || null, chartTimeframe)
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

  const financialsSubLabel =
    FINANCIALS_TABS.find((t) => t.id === financialsTab)?.label ?? ''
  const timeframeLabel = timeframe === 'annual' ? 'Annual' : 'Quarterly'

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
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light text-lg animate-pulse-slow">
            $
          </div>
          <p className="text-white/30 text-sm">Enter a ticker to begin research</p>
        </div>
      )}

      {/* Row 2: Segmented control section tabs */}
      {activeTicker && (
        <div className="glass-card rounded-xl px-4 py-2 flex gap-0.5">
          <div className="flex rounded-lg bg-white/[0.04] p-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
                  activeSection === s.id
                    ? 'bg-accent text-white shadow-sm shadow-accent/25'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview section */}
      {activeTicker && activeSection === 'overview' && (
        <div key="overview" className="animate-slide-fade">
          <OverviewSection
            ticker={activeTicker}
            chartBars={chartData?.bars ?? []}
            chartLoading={chartLoading}
            chartLatestClose={chartData?.latest_close}
            chartTimeframe={chartTimeframe}
            onChartTimeframeChange={setChartTimeframe}
            company={companyData}
            companyLoading={companyLoading}
          />
        </div>
      )}

      {/* Financials section */}
      {activeTicker && activeSection === 'financials' && (
        <div key="financials" className="glass-card rounded-xl p-5 flex flex-col gap-4 border border-white/[0.06] animate-slide-fade">
          {/* Section header */}
          <SectionHeader>{financialsSubLabel} — {timeframeLabel}</SectionHeader>

          {/* Sub-tabs + timeframe toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <SubTabNav
              tabs={FINANCIALS_TABS}
              active={financialsTab}
              onSelect={(id) => setFinancialsTab(id as FinancialsSubTab)}
            />
            <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.06]">
              {(['annual', 'quarterly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
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
        <div key="short" className="glass-card rounded-xl p-5 flex flex-col gap-4 animate-slide-fade">
          {/* Section header */}
          <SectionHeader>
            {SHORT_TABS.find((t) => t.id === shortTab)?.label ?? 'Short Interest'}
          </SectionHeader>

          <SubTabNav
            tabs={SHORT_TABS}
            active={shortTab}
            onSelect={(id) => setShortTab(id as ShortSubTab)}
          />

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
        <div key="float" className="glass-card rounded-xl p-5 animate-slide-fade">
          <SectionHeader>Float Summary</SectionHeader>
          <div className="mt-4">
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
        </div>
      )}
    </div>
  )
}
