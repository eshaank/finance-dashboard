export interface MarketIndex {
  id: string
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  exchange: string
  trend: 'up' | 'down'
}

export interface EconomicDataPoint {
  id: string
  indicator: string
  country: string
  previous: number | null
  forecast: number | null
  actual: number | null
  status: 'beat' | 'missed' | 'inline' | 'pending'
  date: string
  unit: string
}

export interface UpcomingEvent {
  id: string
  name: string
  datetime: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  daysUntil: number
}

export interface OHLCBar {
  date: string
  open: number
  high: number
  low: number
  close: number
}

export interface InsideDayResult {
  ticker: string
  consecutive_inside_days: number
  inside_day_dates: string[]
  mother_bar_date: string | null
  latest_close: number
  compression_pct: number | null
  bars: OHLCBar[]
}
