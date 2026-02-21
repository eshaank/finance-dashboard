import useSWR from 'swr'
import { apiFetcher } from '../lib/swr'
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

const TAB_PATHS: Record<FundamentalsTab, string> = {
  'balance-sheet': '/api/v1/fundamentals/balance-sheet',
  'cash-flow': '/api/v1/fundamentals/cash-flow',
  'income-statement': '/api/v1/fundamentals/income-statement',
  ratios: '/api/v1/fundamentals/ratios',
  'short-interest': '/api/v1/fundamentals/short-interest',
  'short-volume': '/api/v1/fundamentals/short-volume',
  float: '/api/v1/fundamentals/float',
}

export function useFundamentals(ticker: string, tab: FundamentalsTab) {
  const path = TAB_PATHS[tab]
  const key = ticker ? `${path}?ticker=${ticker.toUpperCase()}` : null

  const { data, error, isLoading } = useSWR<FundamentalsData>(
    key,
    apiFetcher,
  )

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  }
}
