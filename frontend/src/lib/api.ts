import { apiFetcher } from './swr'

export const api = {
  getMarketIndices: () => apiFetcher('/api/v1/market-indices'),
  getEconomicData: () => apiFetcher('/api/v1/economic-data'),
  getUpcomingEvents: () => apiFetcher('/api/v1/upcoming-events'),
  getInsideDays: (ticker: string) => apiFetcher(`/api/v1/inside-days?ticker=${ticker.toUpperCase()}`),
  getBalanceSheet: (ticker: string) => apiFetcher(`/api/v1/fundamentals/balance-sheet?ticker=${ticker.toUpperCase()}`),
  getCashFlow: (ticker: string) => apiFetcher(`/api/v1/fundamentals/cash-flow?ticker=${ticker.toUpperCase()}`),
  getIncomeStatement: (ticker: string) => apiFetcher(`/api/v1/fundamentals/income-statement?ticker=${ticker.toUpperCase()}`),
  getRatios: (ticker: string) => apiFetcher(`/api/v1/fundamentals/ratios?ticker=${ticker.toUpperCase()}`),
  getShortInterest: (ticker: string) => apiFetcher(`/api/v1/fundamentals/short-interest?ticker=${ticker.toUpperCase()}`),
  getShortVolume: (ticker: string) => apiFetcher(`/api/v1/fundamentals/short-volume?ticker=${ticker.toUpperCase()}`),
  getFloat: (ticker: string) => apiFetcher(`/api/v1/fundamentals/float?ticker=${ticker.toUpperCase()}`),
  getCompanyDetails: (ticker: string) => apiFetcher(`/api/v1/company/details?ticker=${ticker.toUpperCase()}`),
  getPriceChart: (ticker: string, timeframe: string) =>
    apiFetcher(`/api/v1/price-chart?ticker=${encodeURIComponent(ticker.toUpperCase())}&timeframe=${encodeURIComponent(timeframe)}`),
}
