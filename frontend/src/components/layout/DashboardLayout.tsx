import { InsideDayScanner } from '../scanner/InsideDayScanner'
import { ResearchTab } from '../research/ResearchTab'
import { GlobalEconomicsTab } from '../global-economics/GlobalEconomicsTab'
import { USEconomicsTab } from '../us-economics/USEconomicsTab'
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
      {activeTab === 'us-economics' && <USEconomicsTab />}
      {activeTab === 'global-economics' && (
        <GlobalEconomicsTab />
      )}
    </main>
  )
}
