import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { EconomicCalendar } from '../../components/us-economics/EconomicCalendar'
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EconomicCalendarWidget(_props: WidgetProps) {
  const { data, loading, error } = useUpcomingEvents()

  return (
    <EconomicCalendar events={data} loading={loading} error={error} />
  )
}

registerWidget({
  type: 'economic-calendar',
  name: 'Economic Calendar',
  description: 'Weekly economic data calendar with filters',
  icon: 'Calendar',
  category: 'economics',
  defaultConfig: {},
  defaultLayout: { w: 12, h: 10, minW: 6, minH: 6 },
  component: EconomicCalendarWidget,
})
