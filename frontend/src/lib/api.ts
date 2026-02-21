import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function apiFetch<T>(path: string): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers })
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  getMarketIndices: () => apiFetch('/api/market-indices'),
  getEconomicData: () => apiFetch('/api/economic-data'),
  getUpcomingEvents: () => apiFetch('/api/upcoming-events'),
  getInsideDays: (ticker: string) => apiFetch(`/api/inside-days?ticker=${ticker.toUpperCase()}`),
  getBalanceSheet: (ticker: string) => apiFetch(`/api/fundamentals/balance-sheet?ticker=${ticker.toUpperCase()}`),
  getCashFlow: (ticker: string) => apiFetch(`/api/fundamentals/cash-flow?ticker=${ticker.toUpperCase()}`),
  getIncomeStatement: (ticker: string) => apiFetch(`/api/fundamentals/income-statement?ticker=${ticker.toUpperCase()}`),
  getRatios: (ticker: string) => apiFetch(`/api/fundamentals/ratios?ticker=${ticker.toUpperCase()}`),
  getShortInterest: (ticker: string) => apiFetch(`/api/fundamentals/short-interest?ticker=${ticker.toUpperCase()}`),
  getShortVolume: (ticker: string) => apiFetch(`/api/fundamentals/short-volume?ticker=${ticker.toUpperCase()}`),
  getFloat: (ticker: string) => apiFetch(`/api/fundamentals/float?ticker=${ticker.toUpperCase()}`),
  getCompanyDetails: (ticker: string) => apiFetch(`/api/company/details?ticker=${ticker.toUpperCase()}`),
  getPriceChart: (ticker: string, timeframe: string) =>
    apiFetch(`/api/price-chart?ticker=${encodeURIComponent(ticker.toUpperCase())}&timeframe=${encodeURIComponent(timeframe)}`),
}
