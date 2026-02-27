import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { DividendItem } from '../types'

/**
 * Hook for fetching upcoming dividend events.
 * @returns Object containing dividends data, loading state, and error
 */
export function useUpcomingDividends() {
  const { data, error, isLoading } = useSWR<DividendItem[]>(
    '/api/v1/market/upcoming-dividends',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
