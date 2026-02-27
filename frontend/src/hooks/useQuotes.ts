import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { TickerQuote } from '../types'

interface QuotesResult {
  quotes: TickerQuote[]
}

export function useQuotes(tickers: string[]) {
  const key = tickers.length > 0
    ? `/api/v1/quotes?tickers=${encodeURIComponent(tickers.join(','))}`
    : null

  const { data, error, isLoading } = useSWR<QuotesResult>(key, apiFetcher, {
    refreshInterval: 15_000,
  })

  return {
    quotes: data?.quotes ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
