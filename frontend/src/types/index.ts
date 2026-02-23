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
  category: string
}

export interface UpcomingEvent {
  id: string
  name: string
  datetime: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  daysUntil: number
  actual: number | null
  forecast: number | null
  previous: number | null
  unit: string
}

export interface OHLCBar {
  date: string
  open: number
  high: number
  low: number
  close: number
}

export type ChartTimeframe = '1D' | '1W' | '1M' | '6M' | '12M' | '5Y' | 'Max'

export interface PriceChartResult {
  ticker: string
  timeframe: string
  bars: OHLCBar[]
  latest_close: number
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

export type FundamentalsTab =
  | 'balance-sheet'
  | 'cash-flow'
  | 'income-statement'
  | 'ratios'
  | 'short-interest'
  | 'short-volume'
  | 'float'

export interface BalanceSheetEntry {
  period_end: string
  tickers: string[]
  timeframe: string | null
  fiscal_year: number | null
  fiscal_quarter: number | null
  total_assets: number | null
  total_liabilities: number | null
  total_equity: number | null
  cash_and_equivalents: number | null
  long_term_debt_and_capital_lease_obligations: number | null
}

export interface CashFlowEntry {
  period_end: string
  tickers: string[]
  timeframe: string | null
  fiscal_year: number | null
  fiscal_quarter: number | null
  net_cash_from_operating_activities: number | null
  purchase_of_property_plant_and_equipment: number | null
  net_cash_from_investing_activities: number | null
  net_cash_from_financing_activities: number | null
}

export interface IncomeStatementEntry {
  period_end: string
  tickers: string[]
  timeframe: string | null
  fiscal_year: number | null
  fiscal_quarter: number | null
  revenue: number | null
  gross_profit: number | null
  operating_income: number | null
  consolidated_net_income_loss: number | null
  diluted_earnings_per_share: number | null
  ebitda: number | null
}

export interface RatiosEntry {
  ticker: string
  date: string
  price_to_earnings: number | null
  price_to_book: number | null
  debt_to_equity: number | null
  current: number | null
  return_on_equity: number | null
  return_on_assets: number | null
  market_cap: number | null
}

export interface ShortInterestEntry {
  ticker: string
  settlement_date: string
  short_interest: number | null
  days_to_cover: number | null
  avg_daily_volume: number | null
}

export interface ShortVolumeEntry {
  ticker: string
  date: string
  short_volume: number | null
  total_volume: number | null
  short_volume_ratio: number | null
}

export interface FloatData {
  ticker: string
  free_float: number | null
  free_float_percent: number | null
  effective_date: string | null
}

export interface CompanyDetails {
  ticker: string
  name: string
  description: string
  sic_description: string
  primary_exchange: string
  homepage_url: string | null
  total_employees: number | null
  market_cap: number | null
  logo_url: string | null
}

export interface BulkInsideDayItem {
  ticker: string
  name: string | null
  consecutive_inside_days: number
  compression_pct: number | null
  mother_bar_date: string | null
  latest_close: number
  market_cap: number | null
  inside_day_dates: string[]
  avg_volume: number | null
  today_volume: number | null
  relative_volume: number | null
  atr_pct: number | null
  ticker_type: string | null
}

export interface BulkInsideDayResult {
  results: BulkInsideDayItem[]
  total_scanned: number
  total_with_inside_days: number
  scan_date: string
  preset: string
}

// ── API Envelope ────────────────────────────────────────────────────────────

export interface ApiMeta {
  timestamp: string
  request_id: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}

// ── Global Economics / World Bank ────────────────────────────────────────────

export type IndicatorId = 'gdp' | 'unemployment' | 'govtDebt' | 'interestRate' | 'inflation'

export type YearlyValues = Record<string, number | null>

export interface CountryRecord {
  iso3: string
  iso2: string
  name: string
  value: number | null   // most recent non-null year
  year: string
  yearly: YearlyValues   // { "2022": v, "2023": v, "2024": v }
}

export type IndicatorData = Record<string, CountryRecord>  // keyed by iso3

export type AllIndicatorsData = Partial<Record<IndicatorId, IndicatorData>>
