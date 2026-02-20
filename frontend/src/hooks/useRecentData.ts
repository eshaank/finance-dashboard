import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { EconomicDataPoint } from '../types'

interface State {
  data: EconomicDataPoint[]
  loading: boolean
  error: string | null
}

export function useRecentData(): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    api.getEconomicData()
      .then((data) => setState({ data: data as EconomicDataPoint[], loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: [], loading: false, error: message })
      })
  }, [])

  return state
}
