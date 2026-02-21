import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { InsideDayResult } from '../types'

export function useInsideDays(ticker: string | null) {
  const { data, error, isLoading } = useSWR<InsideDayResult>(
    ticker ? `/api/v1/inside-days?ticker=${ticker.toUpperCase()}` : null,
    apiFetcher,
  )

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
