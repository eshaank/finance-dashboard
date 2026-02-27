import { KeyMarketsGrid } from './KeyMarketsGrid'
import { KeyNewsSection } from './KeyNewsSection'
import { SplitsCard } from './MarketDashboard/SplitsCard'
import { DividendsCard } from './MarketDashboard/DividendsCard'
import { IposCard } from './MarketDashboard/IposCard'
import { RecentDataTable } from '../data/RecentDataTable'

export function MarketsTab() {
  return (
    <div className="px-1.5 md:px-3 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <KeyMarketsGrid />
          <div className="grid grid-cols-3 gap-4">
            <IposCard />
            <SplitsCard />
            <DividendsCard />
          </div>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <KeyNewsSection />
          <RecentDataTable />
        </div>
      </div>
    </div>
  )
}
