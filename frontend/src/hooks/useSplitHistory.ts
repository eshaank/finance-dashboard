import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { SplitHistoryItem } from '../types'

interface SplitHistoryResponse {
  ticker: string
  results: SplitHistoryItem[]
}

/**
 * Hook for fetching historical stock split data for a company.
 * @param ticker - Stock ticker symbol (pass null to skip fetching)
 * @returns Object containing split history data, loading state, and error
 */
export function useSplitHistory(ticker: string | null) {
  const { data, error, isLoading } = useSWR<SplitHistoryResponse>(
    ticker ? `/api/v1/splits?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data?.results ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
