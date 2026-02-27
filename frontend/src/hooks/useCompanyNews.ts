import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { CompanyNewsItem } from '../types'

interface CompanyNewsResponse {
  ticker: string
  results: CompanyNewsItem[]
}

/**
 * Hook for fetching news specific to a company.
 * @param ticker - Stock ticker symbol (pass null to skip fetching)
 * @returns Object containing company news data, loading state, and error
 */
export function useCompanyNews(ticker: string | null) {
  const { data, error, isLoading } = useSWR<CompanyNewsResponse>(
    ticker ? `/api/v1/news?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data?.results ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
