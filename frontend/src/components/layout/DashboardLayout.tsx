import { ScannerTab } from '../scanner/ScannerTab'
import { ResearchTab } from '../research/ResearchTab'
import { USEconomicsTab } from '../us-economics/USEconomicsTab'
import { MarketsTab } from '../markets/MarketsTab'
import type { TabId } from './NavTabs'

interface DashboardLayoutProps {
  activeTab: TabId
}

export function DashboardLayout({ activeTab }: DashboardLayoutProps) {
  return (
    <main className="p-3 md:p-6 animate-fade-in">
      {activeTab === 'scanner' && <ScannerTab />}
      {activeTab === 'research' && <ResearchTab />}
      {activeTab === 'us-economics' && <USEconomicsTab />}
      {activeTab === 'markets' && <MarketsTab />}
    </main>
  )
}
