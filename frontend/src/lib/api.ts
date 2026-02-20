const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
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
}
