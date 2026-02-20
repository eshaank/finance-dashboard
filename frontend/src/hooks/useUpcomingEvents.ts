import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { UpcomingEvent } from '../types'

interface State {
  data: UpcomingEvent[]
  loading: boolean
  error: string | null
}

export function useUpcomingEvents(): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    api.getUpcomingEvents()
      .then((data) => setState({ data: data as UpcomingEvent[], loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: [], loading: false, error: message })
      })
  }, [])

  return state
}
