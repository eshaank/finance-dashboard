import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { MarketIndex } from '../types'

export function useMarketIndices() {
  const { data, error, isLoading } = useSWR<MarketIndex[]>(
    '/api/v1/market-indices',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
