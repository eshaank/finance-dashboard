import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { CompanyDetails } from '../types'

export function useCompany(ticker: string) {
  const { data, error, isLoading } = useSWR<CompanyDetails>(
    ticker ? `/api/v1/company/details?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
