import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { SplitItem } from '../types'

/**
 * Hook for fetching upcoming stock splits.
 * @returns Object containing splits data, loading state, and error
 */
export function useUpcomingSplits() {
  const { data, error, isLoading } = useSWR<SplitItem[]>(
    '/api/v1/market/upcoming-splits',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
