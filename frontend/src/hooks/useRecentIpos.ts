import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { IpoItem } from '../types'

/**
 * Hook for fetching recent IPO listings.
 * @returns Object containing IPO data, loading state, and error
 */
export function useRecentIpos() {
  const { data, error, isLoading } = useSWR<IpoItem[]>(
    '/api/v1/market/recent-ipos',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
