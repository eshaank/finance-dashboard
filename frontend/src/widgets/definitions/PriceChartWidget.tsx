import { useState, useEffect } from 'react'
import { BarChart3, LineChart } from 'lucide-react'
import { registerWidget } from '../registry'
import type { WidgetProps } from '../types'
import { PriceChart } from '../../components/research/PriceChart'
import { usePriceChart } from '../../hooks/usePriceChart'
import type { ChartTimeframe } from '../../types'

function PriceChartWidget({ config, onConfigChange, onTickerChange }: WidgetProps) {
  const ticker = (config.ticker as string) || 'AAPL'
  const timeframe = (config.timeframe as ChartTimeframe) || '6M'
  const [input, setInput] = useState(ticker)

  // Sync input when ticker changes externally (e.g. /go command, link channel)
  useEffect(() => {
    setInput(ticker)
  }, [ticker])

  const { data, loading } = usePriceChart(ticker, timeframe)

  function handleGo() {
    const t = input.trim().toUpperCase()
    if (t && t !== ticker) {
      onConfigChange({ ...config, ticker: t })
      onTickerChange?.(t)
    }
  }

  function handleTimeframeChange(tf: ChartTimeframe) {
    onConfigChange({ ...config, timeframe: tf })
  }

  const lastClose = data?.latest_close ?? 0
  const bars = data?.bars ?? []
  const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : lastClose
  const change = lastClose - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0
  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-dash-green' : 'text-dash-red'
  const changeSign = isPositive ? '+' : ''

  return (
    <div className="flex flex-col">
      {/* Header section */}
      <div className="px-3 pt-2 pb-1 shrink-0 border-b border-dash-border">
        {/* Ticker input row */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            placeholder="Ticker"
            className="w-28 px-2 py-1 text-xs font-mono bg-white/[0.03] border border-dash-border text-dash-text placeholder:text-dash-muted/50 focus:outline-none focus:border-accent-blue"
          />
          <button
            onClick={handleGo}
            className="px-2 py-1 text-[10px] font-mono font-medium uppercase bg-white/[0.06] hover:bg-white/10 text-dash-text transition-colors border border-dash-border cursor-pointer"
          >
            Go
          </button>
        </div>

        {/* Price display */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-dash-muted">
            {ticker} US
          </span>
          {!loading && lastClose > 0 && (
            <>
              <span className="text-xl font-mono font-semibold text-dash-text">
                {lastClose.toFixed(2)}
              </span>
              <span className={`text-sm font-mono ${changeColor}`}>
                {changeSign}{change.toFixed(2)} ({changeSign}{changePct.toFixed(2)}%)
              </span>
            </>
          )}
        </div>

        {/* Timeframe buttons */}
        <div className="flex gap-0.5 mb-1">
          {(['1D', '1W', '1M', '6M', '12M', '5Y', 'Max'] as ChartTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-2.5 py-1 text-[10px] font-mono font-medium uppercase transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-accent-blue text-white'
                  : 'bg-transparent text-dash-muted hover:text-dash-text'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] px-1 py-1">
        <PriceChart
          ticker={ticker}
          bars={bars}
          latestClose={data?.latest_close}
          loading={loading}
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          hideHeader
          hideTimeframes
        />
      </div>

      {/* Toolbar placeholder */}
      <div className="flex items-center gap-2 px-3 py-1 border-t border-dash-border shrink-0">
        <button className="p-1 text-dash-muted hover:text-dash-text transition-colors cursor-pointer" title="Line chart">
          <LineChart className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 text-dash-muted hover:text-dash-text transition-colors cursor-pointer" title="Candlestick">
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-dash-muted/50 ml-auto">Indicators</span>
      </div>
    </div>
  )
}

registerWidget({
  type: 'price-chart',
  name: 'Price Chart',
  description: 'Interactive price chart with crosshair',
  icon: 'LineChart',
  category: 'market',
  defaultConfig: { ticker: 'AAPL', timeframe: '6M' },
  defaultLayout: { w: 420, h: 200 },
  component: PriceChartWidget,
})
