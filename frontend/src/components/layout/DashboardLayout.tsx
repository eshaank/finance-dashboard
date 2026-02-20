import { useState } from 'react'
import { MarketIndicesGrid } from '../market/MarketIndicesGrid'
import { RecentDataTable } from '../data/RecentDataTable'
import { UpcomingEventsPanel } from '../events/UpcomingEventsPanel'
import { InsideDayScanner } from '../scanner/InsideDayScanner'
import { NavTabs } from './NavTabs'

type ActiveTab = 'scanner' | 'overview'

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  return (
    <>
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="p-6 animate-fade-in">
        {activeTab === 'scanner' && (
          <InsideDayScanner />
        )}
        {activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <MarketIndicesGrid />
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
              <RecentDataTable />
              <UpcomingEventsPanel />
            </div>
          </>
        )}
      </main>
    </>
  )
}
