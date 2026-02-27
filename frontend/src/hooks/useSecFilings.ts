import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { SecFilingItem } from '../types'

interface SecFilingsResponse {
  ticker: string
  cik: string | null
  results: SecFilingItem[]
}

/**
 * Hook for fetching SEC filings for a company.
 * @param ticker - Stock ticker symbol (pass null to skip fetching)
 * @returns Object containing SEC filings data, loading state, and error
 */
export function useSecFilings(ticker: string | null) {
  const { data, error, isLoading } = useSWR<SecFilingsResponse>(
    ticker ? `/api/v1/filings?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data?.results ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
