import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { PolymarketStats } from '../types'

export function usePolymarketStats() {
  const { data, error, isLoading } = useSWR<PolymarketStats>(
    '/api/v1/polymarket/stats',
    apiFetcher,
    { refreshInterval: 120_000 },
  )

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
