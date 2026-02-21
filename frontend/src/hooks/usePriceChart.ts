import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { ChartTimeframe, PriceChartResult } from '../types'

export function usePriceChart(ticker: string | null, timeframe: ChartTimeframe) {
  const { data, error, isLoading } = useSWR<PriceChartResult>(
    ticker
      ? `/api/v1/price-chart?ticker=${encodeURIComponent(ticker.toUpperCase())}&timeframe=${encodeURIComponent(timeframe)}`
      : null,
    apiFetcher,
  )

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
