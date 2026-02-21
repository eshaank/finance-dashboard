import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { CompanyDetails } from '../types'

interface State {
  data: CompanyDetails | null
  loading: boolean
  error: string | null
}

export function useCompany(ticker: string): State {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  useEffect(() => {
    if (!ticker) {
      setState({ data: null, loading: false, error: null })
      return
    }

    setState({ data: null, loading: true, error: null })

    ;(api.getCompanyDetails(ticker) as Promise<CompanyDetails>)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error: message })
      })
  }, [ticker])

  return state
}
