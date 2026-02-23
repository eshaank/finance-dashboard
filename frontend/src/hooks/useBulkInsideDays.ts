import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
import type { BulkInsideDayResult } from '../types'

interface BulkScanParams {
  preset: string
  minCap?: number
  maxCap?: number
  minPrice?: number
  minAvgVolume?: number
  minRelativeVolume?: number
  minAtrPct?: number
  excludeEtfs?: boolean
}

export function useBulkInsideDays(params: BulkScanParams | null) {
  const key = params
    ? (() => {
      const p = new URLSearchParams()
      p.set('preset', params.preset)
      if (params.minCap !== undefined) p.set('min_cap', String(params.minCap))
      if (params.maxCap !== undefined) p.set('max_cap', String(params.maxCap))
      if (params.minPrice !== undefined) p.set('min_price', String(params.minPrice))
      if (params.minAvgVolume !== undefined) p.set('min_avg_volume', String(params.minAvgVolume))
      if (params.minRelativeVolume !== undefined) p.set('min_relative_volume', String(params.minRelativeVolume))
      if (params.minAtrPct !== undefined) p.set('min_atr_pct', String(params.minAtrPct))
      if (params.excludeEtfs !== undefined) p.set('exclude_etfs', String(params.excludeEtfs))
      return `/api/v1/scan-inside-days?${p.toString()}`
    })()
    : null

  const { data, error, isLoading } = useSWR<BulkInsideDayResult>(key, apiFetcher)

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
