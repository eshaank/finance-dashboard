import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { UpcomingEventsPanel } from '../../components/events/UpcomingEventsPanel'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UpcomingEventsWidget(_props: WidgetProps) {
  return <UpcomingEventsPanel />
}

registerWidget({
  type: 'upcoming-events',
  name: 'Upcoming Events',
  description: 'Next economic data releases and events',
  icon: 'CalendarClock',
  category: 'economics',
  defaultConfig: {},
  defaultLayout: { w: 580, h: 320 },
  component: UpcomingEventsWidget,
})
