import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { InsideDayResult } from '../types'

interface State {
  data: InsideDayResult | null
  loading: boolean
  error: string | null
}

export function useInsideDays(ticker: string | null): State {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  useEffect(() => {
    if (!ticker) return

    setState({ data: null, loading: true, error: null })

    api.getInsideDays(ticker)
      .then((data) => setState({ data: data as InsideDayResult, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error: message })
      })
  }, [ticker])

  return state
}
