import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { ChartTimeframe, PriceChartResult } from '../types'

interface State {
  data: PriceChartResult | null
  loading: boolean
  error: string | null
}

export function usePriceChart(ticker: string | null, timeframe: ChartTimeframe): State {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  useEffect(() => {
    if (!ticker) return

    setState({ data: null, loading: true, error: null })

    api.getPriceChart(ticker, timeframe)
      .then((data) => setState({ data: data as PriceChartResult, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error: message })
      })
  }, [ticker, timeframe])

  return state
}
