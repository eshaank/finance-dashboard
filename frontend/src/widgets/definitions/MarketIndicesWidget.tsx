import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { MarketIndicesGrid } from '../../components/market/MarketIndicesGrid'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MarketIndicesWidget(_props: WidgetProps) {
  return <MarketIndicesGrid />
}

registerWidget({
  type: 'market-indices',
  name: 'Market Indices',
  description: 'Live major market index prices and changes',
  icon: 'BarChart3',
  category: 'market',
  defaultConfig: {},
  defaultLayout: { w: 1200, h: 220 },
  component: MarketIndicesWidget,
})
