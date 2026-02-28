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
  volume: number
}

export type ChartTimeframe = '1D' | '1W' | '1M' | '6M' | '12M' | '5Y' | 'Max'

export interface PriceChartResult {
  ticker: string
  timeframe: string
  bars: OHLCBar[]
  latest_close: number
}

export interface TickerQuote {
  ticker: string
  last: number
  change: number
  change_percent: number
  volume: number
  prev_close: number
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

// ── Market-Wide Data ──────────────────────────────────────────────────────────

export interface MarketNewsItem {
  id: string
  title: string
  description: string | null
  article_url: string
  published_utc: string
  tickers: string[]
  publisher_name?: string
  publisher_homepage_url?: string | null
  image_url?: string | null
}

export interface SplitItem {
  ticker: string
  execution_date: string
  split_from: number
  split_to: number
  is_reverse: boolean
}

export interface DividendItem {
  ticker: string
  ex_dividend_date: string
  cash_amount: number
  frequency: string
  dividend_type: string
}

export interface IpoItem {
  ticker: string
  name: string
  listing_date: string
  exchange: string
}

// ── Company-Specific Data ──────────────────────────────────────────────────────

export interface CompanyNewsItem extends MarketNewsItem {}

export interface DividendHistoryItem {
  ticker: string
  ex_dividend_date: string
  cash_amount: number
  pay_date?: string
  record_date?: string
  declaration_date?: string
  frequency: string | null
}

export interface SplitHistoryItem {
  ticker: string
  execution_date: string
  split_from: number
  split_to: number
  is_reverse: boolean
}

export interface SecFilingItem {
  ticker: string
  filing_type: string
  filing_date: string
  period_of_report_date?: string
  link: string
}

// ── Chart Events ───────────────────────────────────────────────────────────────

export interface ChartEvent {
  date: string
  type: 'dividend' | 'reverse-split' | 'split'
  value: string
  description: string
}

// ── Polymarket ─────────────────────────────────────────────────────────────────

export interface PolymarketMarket {
  id: string
  question: string
  outcomes: string[]
  outcome_prices: number[]
  volume: number
  liquidity: number
  active: boolean
  closed: boolean
  end_date: string | null
}

export interface PolymarketEvent {
  id: string
  slug: string
  title: string
  description: string | null
  category: string | null
  image: string | null
  volume: number
  volume_24hr: number
  liquidity: number
  open_interest: number
  markets: PolymarketMarket[]
}

export interface CategoryBreakdown {
  name: string
  count: number
  volume_24hr: number
}

export interface PolymarketStats {
  active_markets: number
  total_volume_24hr: number
  total_open_interest: number
  total_liquidity: number
  categories: CategoryBreakdown[]
}

export interface PolymarketEventsResponse {
  events: PolymarketEvent[]
  trending: PolymarketEvent[]
  total: number
}

export type ChartType = 'line' | 'candle'
export type CompanyTab = 'overview' | 'news' | 'financials' | 'actions' | 'ownership' | 'filings'
