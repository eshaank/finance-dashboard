import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { EconomicDataPoint } from '../types'

export function useRecentData() {
  const { data, error, isLoading } = useSWR<EconomicDataPoint[]>(
    '/api/v1/economic-data',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
