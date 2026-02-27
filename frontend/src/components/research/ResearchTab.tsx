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
import { OwnershipTab } from './OwnershipTab'
import { NewsTab } from './NewsTab'
import { ActionsTab } from './ActionsTab'
import { FilingsTab } from './FilingsTab'

type CompanyTab = 'overview' | 'news' | 'financials' | 'actions' | 'ownership' | 'filings'
type FinancialsSubTab = 'income-statement' | 'balance-sheet' | 'cash-flow'

const TABS: { id: CompanyTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'news', label: 'News' },
  { id: 'financials', label: 'Financials' },
  { id: 'actions', label: 'Actions' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'filings', label: 'Filings' },
]

function getFundTab(tab: CompanyTab, financialsTab: FinancialsSubTab): FundamentalsTab {
  if (tab === 'financials') return financialsTab
  return 'income-statement'
}

export function ResearchTab() {
  const [input, setInput] = useState('')
  const [activeTicker, setActiveTicker] = useState('')
  const [activeTab, setActiveTab] = useState<CompanyTab>('overview')
  const [financialsTab, setFinancialsTab] = useState<FinancialsSubTab>('income-statement')
  const [timeframe, setTimeframe] = useState<'annual' | 'quarterly'>('annual')
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M')

  const { data: priceData, loading: priceLoading } = useInsideDays(activeTicker || null)
  const { data: chartData, loading: chartLoading } = usePriceChart(activeTicker || null, chartTimeframe)
  const { data: companyData, loading: companyLoading } = useCompany(activeTicker)

  const fundTab = getFundTab(activeTab, financialsTab)
  const { data: fundData, loading: fundLoading, error: fundError } = useFundamentals(
    activeTicker && activeTab === 'financials' ? activeTicker : '',
    fundTab,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim().toUpperCase()
    if (!trimmed) return
    setActiveTicker(trimmed)
    setActiveTab('overview')
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

      {!activeTicker && (
        <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-white/40 font-medium">Enter a ticker to begin research</p>
          <p className="text-xs text-white/20 mt-1.5">
            Overview, financials, news, corporate actions, and filings
          </p>
        </div>
      )}

      {activeTicker && (
        <>
          <nav
            className="glass-card rounded-xl px-3 py-2 sm:px-4 overflow-x-auto scrollbar-hide"
            role="tablist"
            aria-label="Research tabs"
          >
            <div className="flex rounded-lg bg-white/[0.04] p-0.5">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      const nextIndex = (index + 1) % TABS.length
                      setActiveTab(TABS[nextIndex].id)
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      const prevIndex = (index - 1 + TABS.length) % TABS.length
                      setActiveTab(TABS[prevIndex].id)
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200',
                    'min-h-[36px] flex items-center justify-center',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                    activeTab === tab.id
                      ? 'bg-accent text-white shadow-sm shadow-accent/25'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {activeTab === 'overview' && (
            <div
              key="overview"
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              className="animate-slide-fade"
            >
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

          {activeTab === 'news' && (
            <div
              key="news"
              id="panel-news"
              role="tabpanel"
              aria-labelledby="tab-news"
              className="animate-slide-fade"
            >
              <NewsTab ticker={activeTicker} />
            </div>
          )}

          {activeTab === 'financials' && (
            <div
              key="financials"
              id="panel-financials"
              role="tabpanel"
              aria-labelledby="tab-financials"
              className="animate-slide-fade"
            >
              <FinancialsSection
                financialsTab={financialsTab}
                onFinancialsTabChange={setFinancialsTab}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                data={fundData}
                loading={fundLoading}
                error={fundError}
              />
            </div>
          )}

          {activeTab === 'actions' && (
            <div
              key="actions"
              id="panel-actions"
              role="tabpanel"
              aria-labelledby="tab-actions"
              className="animate-slide-fade"
            >
              <ActionsTab ticker={activeTicker} />
            </div>
          )}

          {activeTab === 'ownership' && (
            <div
              key="ownership"
              id="panel-ownership"
              role="tabpanel"
              aria-labelledby="tab-ownership"
              className="animate-slide-fade"
            >
              <OwnershipTab ticker={activeTicker} />
            </div>
          )}

          {activeTab === 'filings' && (
            <div
              key="filings"
              id="panel-filings"
              role="tabpanel"
              aria-labelledby="tab-filings"
              className="animate-slide-fade"
            >
              <FilingsTab ticker={activeTicker} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
