import { cn } from '../../../lib/utils'
import { NewsCard } from './NewsCard'
import { SplitsCard } from './SplitsCard'
import { DividendsCard } from './DividendsCard'
import { IposCard } from './IposCard'

interface MarketDashboardProps {
  className?: string
}

export function MarketDashboard({ className }: MarketDashboardProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NewsCard className="col-span-1 sm:col-span-2 lg:col-span-2 min-h-[300px]" />
        <SplitsCard className="col-span-1 min-h-[300px]" />
        <DividendsCard className="col-span-1 min-h-[300px]" />
        <IposCard className="col-span-1 sm:col-span-2 lg:col-span-2 min-h-[220px]" />
      </div>
    </div>
  )
}

export { NewsCard, SplitsCard, DividendsCard, IposCard }
