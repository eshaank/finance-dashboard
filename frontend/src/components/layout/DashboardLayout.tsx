import { MarketIndicesGrid } from '../market/MarketIndicesGrid'
import { RecentDataTable } from '../data/RecentDataTable'
import { UpcomingEventsPanel } from '../events/UpcomingEventsPanel'
import { InsideDayScanner } from '../scanner/InsideDayScanner'
import { ResearchTab } from '../research/ResearchTab'
import { GlobalEconomicsTab } from '../global-economics/GlobalEconomicsTab'
import type { TabId } from './NavTabs'

interface DashboardLayoutProps {
  activeTab: TabId
}

export function DashboardLayout({ activeTab }: DashboardLayoutProps) {
  return (
    <main className="p-3 md:p-6 animate-fade-in">
      {activeTab === 'scanner' && (
        <InsideDayScanner />
      )}
      {activeTab === 'research' && (
        <ResearchTab />
      )}
      {activeTab === 'us-economics' && (
        <>
          <div className="mb-4 md:mb-6">
            <MarketIndicesGrid />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[1fr_360px]">
            <RecentDataTable />
            <UpcomingEventsPanel />
          </div>
        </>
      )}
      {activeTab === 'global-economics' && (
        <GlobalEconomicsTab />
      )}
    </main>
  )
}
