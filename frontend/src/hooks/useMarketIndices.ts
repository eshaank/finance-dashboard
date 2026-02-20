import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { MarketIndex } from '../types'

interface State {
  data: MarketIndex[]
  loading: boolean
  error: string | null
}

export function useMarketIndices(): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    api.getMarketIndices()
      .then((data) => setState({ data: data as MarketIndex[], loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: [], loading: false, error: message })
      })
  }, [])

  return state
}
