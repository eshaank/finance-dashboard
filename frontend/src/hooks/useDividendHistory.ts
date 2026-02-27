import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { DividendHistoryItem } from '../types'

interface DividendHistoryResponse {
  ticker: string
  results: DividendHistoryItem[]
}

/**
 * Hook for fetching historical dividend data for a company.
 * @param ticker - Stock ticker symbol (pass null to skip fetching)
 * @returns Object containing dividend history data, loading state, and error
 */
export function useDividendHistory(ticker: string | null) {
  const { data, error, isLoading } = useSWR<DividendHistoryResponse>(
    ticker ? `/api/v1/dividends?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data?.results ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
