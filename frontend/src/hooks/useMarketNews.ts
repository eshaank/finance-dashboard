import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { MarketNewsItem } from '../types'

/**
 * Hook for fetching general market news.
 * @param limit - Maximum number of news items to fetch (default: 10)
 * @returns Object containing news data, loading state, and error
 */
export function useMarketNews(limit = 10) {
  const { data, error, isLoading } = useSWR<MarketNewsItem[]>(
    `/api/v1/market/news?limit=${limit}`,
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
