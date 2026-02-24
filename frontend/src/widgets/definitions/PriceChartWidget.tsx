import { useState } from 'react'
import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { PriceChart } from '../../components/research/PriceChart'
import { usePriceChart } from '../../hooks/usePriceChart'
import type { ChartTimeframe } from '../../types'

function PriceChartWidget({ config, onConfigChange }: WidgetProps) {
  const ticker = (config.ticker as string) || 'SPY'
  const timeframe = (config.timeframe as ChartTimeframe) || '6M'
  const [input, setInput] = useState(ticker)

  const { data, loading } = usePriceChart(ticker, timeframe)

  function handleGo() {
    const t = input.trim().toUpperCase()
    if (t && t !== ticker) {
      onConfigChange({ ...config, ticker: t })
    }
  }

  function handleTimeframeChange(tf: ChartTimeframe) {
    onConfigChange({ ...config, timeframe: tf })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          placeholder="Ticker"
          className="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-dash-text placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={handleGo}
          className="px-2 py-1 text-xs font-medium bg-white/10 hover:bg-white/15 rounded-md text-dash-text transition-colors"
        >
          Go
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <PriceChart
          ticker={ticker}
          bars={data?.bars ?? []}
          latestClose={data?.latest_close}
          loading={loading}
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
        />
      </div>
    </div>
  )
}

registerWidget({
  type: 'price-chart',
  name: 'Price Chart',
  description: 'Interactive price chart for any ticker',
  icon: 'LineChart',
  category: 'market',
  defaultConfig: { ticker: 'SPY', timeframe: '6M' },
  defaultLayout: { w: 6, h: 10, minW: 4, minH: 6 },
  component: PriceChartWidget,
})
