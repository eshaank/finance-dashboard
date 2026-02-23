import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { BulkInsideDayResult } from '../types'

interface BulkScanParams {
  preset: string
  minCap?: number
  maxCap?: number
}

export function useBulkInsideDays(params: BulkScanParams | null) {
  const key = params
    ? `/api/v1/scan-inside-days?preset=${params.preset}${params.minCap !== undefined ? `&min_cap=${params.minCap}` : ''}${params.maxCap !== undefined ? `&max_cap=${params.maxCap}` : ''}`
    : null

  const { data, error, isLoading } = useSWR<BulkInsideDayResult>(key, apiFetcher)

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
