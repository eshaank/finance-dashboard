import { useMemo } from 'react'
import type { ChartTimeframe, CompanyDetails, OHLCBar, ChartEvent } from '../../types'
import type { ChartType } from './PriceChart'
import { cn } from '../../lib/utils'
import { PriceChart } from './PriceChart'
import { useDividendHistory } from '../../hooks/useDividendHistory'
import { useSplitHistory } from '../../hooks/useSplitHistory'
import { LineChart, BarChart3 } from 'lucide-react'

interface Props {
  ticker: string
  chartBars: OHLCBar[]
  chartLoading: boolean
  chartLatestClose?: number
  chartTimeframe: ChartTimeframe
  onChartTimeframeChange: (tf: ChartTimeframe) => void
  company: CompanyDetails | null
  companyLoading: boolean
}

const TIMEFRAMES: ChartTimeframe[] = ['1D', '1W', '1M', '6M', '12M', '5Y', 'Max']

export function OverviewSection({
  ticker,
  chartBars,
  chartLoading,
  chartLatestClose,
  chartTimeframe,
  onChartTimeframeChange,
  company,
  companyLoading,
}: Props) {
  const chartType: ChartType = 'line'
  const bars = chartBars

  // Calculate price change
  const lastClose = chartLatestClose ?? (bars.length > 0 ? bars[bars.length - 1].close : 0)
  const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : lastClose
  const change = lastClose - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0
  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-dash-green' : 'text-dash-red'
  const changeSign = isPositive ? '+' : ''
  const lineColor = isPositive ? '#00cc66' : '#ff4444'

  // Fetch dividends and splits
  const { data: dividends } = useDividendHistory(ticker)
  const { data: splits } = useSplitHistory(ticker)

  // Transform to ChartEvent[]
  const chartEvents: ChartEvent[] = useMemo(() => {
    const events: ChartEvent[] = []
    
    // Add dividends
    dividends?.forEach(d => {
      events.push({
        date: d.ex_dividend_date,
        type: 'dividend',
        value: d.cash_amount.toFixed(2),
        description: `Ex-Dividend: $${d.cash_amount.toFixed(2)} (${d.frequency})`,
      })
    })
    
    // Add splits
    splits?.forEach(s => {
      events.push({
        date: s.execution_date,
        type: s.is_reverse ? 'reverse-split' : 'split',
        value: `${s.split_from}:${s.split_to}`,
        description: `${s.is_reverse ? 'Reverse ' : ''}Split ${s.split_from}:${s.split_to}`,
      })
    })
    
    return events
  }, [dividends, splits])

  return (
    <div className="flex flex-col">
      {/* Header section - Terminal style */}
      <div className="px-3 pt-2 pb-1 shrink-0 border-b border-dash-border">
        {/* Ticker display row */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-dash-muted">
            {ticker} US
          </span>
          {!chartLoading && lastClose > 0 && (
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
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onChartTimeframeChange(tf)}
              className={`px-2.5 py-1 text-[10px] font-mono font-medium uppercase transition-colors cursor-pointer ${
                chartTimeframe === tf
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
          latestClose={chartLatestClose}
          loading={chartLoading}
          timeframe={chartTimeframe}
          onTimeframeChange={onChartTimeframeChange}
          chartType={chartType}
          events={chartEvents}
          lineColor={lineColor}
          hideHeader
          hideTimeframes
          hideChartToggle
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1 border-t border-dash-border shrink-0">
        <button 
          className="p-1 text-dash-muted hover:text-dash-text transition-colors cursor-pointer" 
          title="Line chart"
        >
          <LineChart className="w-3.5 h-3.5" />
        </button>
        <button 
          className="p-1 text-dash-muted hover:text-dash-text transition-colors cursor-pointer" 
          title="Candlestick"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-dash-muted/50 ml-auto">Indicators</span>
      </div>
    </div>
  )
}
