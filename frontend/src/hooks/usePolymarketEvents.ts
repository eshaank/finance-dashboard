import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { PolymarketEventsResponse } from '../types'

export function usePolymarketEvents(category?: string, limit = 50) {
  const params = new URLSearchParams()
  if (category && category.toLowerCase() !== 'all') {
    params.set('category', category)
  }
  params.set('limit', String(limit))

  const { data, error, isLoading } = useSWR<PolymarketEventsResponse>(
    `/api/v1/polymarket/events?${params.toString()}`,
    apiFetcher,
    { refreshInterval: 120_000 },
  )

  return {
    events: data?.events ?? [],
    trending: data?.trending ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
