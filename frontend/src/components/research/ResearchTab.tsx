import { useState } from 'react'
import type { ChartTimeframe, FundamentalsTab } from '../../types'
import { useInsideDays } from '../../hooks/useInsideDays'
import { usePriceChart } from '../../hooks/usePriceChart'
import { useFundamentals } from '../../hooks/useFundamentals'
import { useCompany } from '../../hooks/useCompany'
import { cn } from '../../lib/utils'
import { CompanyHeader } from './CompanyHeader'
import { OverviewSection } from './OverviewSection'
import { FinancialsSection } from './FinancialsSection'
import { ShortInterestSection } from './ShortInterestSection'
import { FloatSection } from './FloatSection'

type ResearchSection = 'overview' | 'financials' | 'short' | 'float'
type FinancialsSubTab = 'income-statement' | 'balance-sheet' | 'cash-flow'
type ShortSubTab = 'short-interest' | 'short-volume'

const SECTIONS: { id: ResearchSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'short', label: 'Short Interest' },
  { id: 'float', label: 'Float' },
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
  const [timeframe, setTimeframe] = useState<'annual' | 'quarterly'>('annual')
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

  return (
    <div className="flex flex-col gap-3">
      <CompanyHeader
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        ticker={activeTicker}
        company={companyData}
        priceData={priceData}
        loading={priceLoading}
      />

      {!activeTicker ? (
        <div className="glass-card rounded-xl p-8 md:p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light text-lg animate-pulse-slow">
            $
          </div>
          <p className="text-white/30 text-sm">Enter a ticker to begin research</p>
        </div>
      ) : null}

      {activeTicker ? (
        <div className="glass-card rounded-xl px-3 py-2 sm:px-4 overflow-x-auto scrollbar-hide">
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
      ) : null}

      {activeTicker && activeSection === 'overview' ? (
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
      ) : null}

      {activeTicker && activeSection === 'financials' ? (
        <FinancialsSection
          financialsTab={financialsTab}
          onFinancialsTabChange={setFinancialsTab}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          data={fundData}
          loading={fundLoading}
          error={fundError}
        />
      ) : null}

      {activeTicker && activeSection === 'short' ? (
        <ShortInterestSection
          shortTab={shortTab}
          onShortTabChange={setShortTab}
          data={fundData}
          loading={fundLoading}
          error={fundError}
        />
      ) : null}

      {activeTicker && activeSection === 'float' ? (
        <FloatSection data={fundData} loading={fundLoading} error={fundError} />
      ) : null}
    </div>
  )
}
