import type { SWRConfiguration } from 'swr'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetcher<T>(path: string): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers })
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  const json = await response.json()

  // Unwrap envelope if present: { data, meta } -> data
  if (json && typeof json === 'object' && 'data' in json && 'meta' in json) {
    return json.data as T
  }
  return json as T
}

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  dedupingInterval: 5000,
}
