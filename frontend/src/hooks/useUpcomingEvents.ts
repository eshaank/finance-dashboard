import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { UpcomingEvent } from '../types'

export function useUpcomingEvents() {
  const { data, error, isLoading } = useSWR<UpcomingEvent[]>(
    '/api/v1/upcoming-events',
    apiFetcher,
  )

  return {
    data: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
