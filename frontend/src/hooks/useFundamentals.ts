import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type {
  BalanceSheetEntry,
  CashFlowEntry,
  FloatData,
  FundamentalsTab,
  IncomeStatementEntry,
  RatiosEntry,
  ShortInterestEntry,
  ShortVolumeEntry,
} from '../types'

type FundamentalsData =
  | BalanceSheetEntry[]
  | CashFlowEntry[]
  | IncomeStatementEntry[]
  | RatiosEntry[]
  | ShortInterestEntry[]
  | ShortVolumeEntry[]
  | FloatData
  | null

interface State {
  data: FundamentalsData
  loading: boolean
  error: string | null
}

const fetchers: Record<FundamentalsTab, (ticker: string) => Promise<unknown>> = {
  'balance-sheet': api.getBalanceSheet,
  'cash-flow': api.getCashFlow,
  'income-statement': api.getIncomeStatement,
  ratios: api.getRatios,
  'short-interest': api.getShortInterest,
  'short-volume': api.getShortVolume,
  float: api.getFloat,
}

export function useFundamentals(ticker: string, tab: FundamentalsTab): State {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  useEffect(() => {
    if (!ticker) return

    setState({ data: null, loading: true, error: null })

    fetchers[tab](ticker)
      .then((data) => setState({ data: data as FundamentalsData, loading: false, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error: message })
      })
  }, [ticker, tab])

  return state
}
