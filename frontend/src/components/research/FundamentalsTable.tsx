import type {
  BalanceSheetEntry,
  CashFlowEntry,
  FloatData,
  FundamentalsTab,
  IncomeStatementEntry,
  RatiosEntry,
  ShortInterestEntry,
  ShortVolumeEntry,
} from '../../types'
import { cn } from '../../lib/utils'

type Timeframe = 'annual' | 'quarterly'

function fmtLarge(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`
  return v.toFixed(2)
}

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
}

function fmtBasic(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined) return '—'
  return v.toFixed(decimals)
}

function periodLabel(r: { period_end: string; timeframe: string | null; fiscal_quarter: number | null }): string {
  if (r.timeframe === 'annual') return `FY ${r.period_end.slice(0, 4)}`
  if (r.fiscal_quarter) return `Q${r.fiscal_quarter} ${r.period_end.slice(0, 4)}`
  return r.period_end.slice(0, 7)
}

function subValueColor(val: string): string {
  if (val === '—') return 'text-white/30'
  if (val.startsWith('+')) return 'text-emerald-400'
  if (val.startsWith('-')) return 'text-rose-400'
  return 'text-white/40'
}

interface MetricRow {
  label: string
  bold: boolean
  getValue: (idx: number) => string
  subRows?: { label: string; getValue: (idx: number) => string }[]
}

interface TransposedTableProps {
  periodHeaders: string[]
  metricRows: MetricRow[]
}

function TransposedTable({ periodHeaders, metricRows }: TransposedTableProps) {
  if (periodHeaders.length === 0) {
    return <p className="text-white/30 text-sm py-4">No data available.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/[0.10] bg-white/[0.02]">
            <th className="text-left py-2.5 pr-4 text-xs text-white/30 font-medium min-w-[160px] sticky left-0 bg-dash-surface z-10">
              Metric
            </th>
            {periodHeaders.map((h, idx) => (
              <th
                key={h}
                className={cn(
                  'py-2.5 px-3 text-right font-mono text-xs uppercase whitespace-nowrap font-medium',
                  idx === 0 ? 'text-white font-semibold' : 'text-white/50',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricRows.map((row, rowIdx) => (
            <>
              <tr
                key={`row-${rowIdx}`}
                className={cn(
                  'border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors',
                  rowIdx > 0 && metricRows[rowIdx - 1].subRows && 'border-t border-white/[0.08]',
                  rowIdx % 2 === 1 && 'bg-white/[0.015]',
                )}
              >
                <td
                  className={cn(
                    'py-2 pr-4 text-xs whitespace-nowrap sticky left-0 bg-dash-surface z-10',
                    row.bold
                      ? 'font-semibold text-white/90 border-l-2 border-accent/60 pl-2'
                      : 'text-white/70',
                    rowIdx % 2 === 1 && 'bg-dash-surface',
                  )}
                >
                  {row.label}
                </td>
                {periodHeaders.map((_, colIdx) => {
                  const val = row.getValue(colIdx)
                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        'py-2 px-3 font-mono text-xs text-right whitespace-nowrap',
                        colIdx === 0 ? 'bg-white/[0.025]' : '',
                        row.bold ? 'text-white/[0.85]' : 'text-white/70',
                      )}
                    >
                      {val}
                    </td>
                  )
                })}
              </tr>
              {row.subRows?.map((sub, subIdx) => (
                <tr
                  key={`row-${rowIdx}-sub-${subIdx}`}
                  className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-1 pr-4 pl-4 text-xs italic text-white/40 whitespace-nowrap sticky left-0 bg-dash-surface z-10">
                    {sub.label}
                  </td>
                  {periodHeaders.map((_, colIdx) => {
                    const val = sub.getValue(colIdx)
                    return (
                      <td
                        key={colIdx}
                        className={cn(
                          'py-1 px-3 font-mono text-xs text-right whitespace-nowrap italic',
                          colIdx === 0 ? 'bg-white/[0.025]' : '',
                          subValueColor(val),
                        )}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SimpleTable({ columns, rows }: {
  columns: { header: string; render: (row: unknown) => string }[]
  rows: unknown[]
}) {
  if (rows.length === 0) {
    return <p className="text-white/30 text-sm py-4">No data available.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.10] bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.header}
                className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-b border-white/[0.03] hover:bg-white/[0.03] hover:border-l-2 hover:border-l-accent/40 transition-colors',
                i % 2 === 1 && 'bg-white/[0.015]',
              )}
            >
              {columns.map((col) => (
                <td key={col.header} className="py-2 px-3 text-white/70 font-mono text-xs whitespace-nowrap">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface Props {
  tab: FundamentalsTab
  data: unknown
  timeframe?: Timeframe
}

export function FundamentalsTable({ tab, data, timeframe = 'annual' }: Props) {
  if (!data) return null

  const needsArray = tab !== 'float'
  if (needsArray && !Array.isArray(data)) return null

  // --- Float ---
  if (tab === 'float') {
    const f = data as FloatData
    return (
      <div className="flex flex-col gap-5 py-2">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Free Float', value: f.free_float?.toLocaleString() ?? '—' },
            { label: 'Float %', value: f.free_float_percent !== null ? `${f.free_float_percent?.toFixed(2)}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl px-5 py-4 border border-white/[0.07]">
              <p className="text-xs text-white/40 mb-1.5">{label}</p>
              <p className="text-xl font-display font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        {f.effective_date && (
          <p className="text-xs text-white/30 font-mono">As of {f.effective_date}</p>
        )}
      </div>
    )
  }

  // --- Short Interest ---
  if (tab === 'short-interest') {
    const rows = data as ShortInterestEntry[]
    return (
      <SimpleTable
        rows={rows}
        columns={[
          { header: 'Settlement Date', render: (r) => (r as ShortInterestEntry).settlement_date },
          { header: 'Short Interest', render: (r) => fmtLarge((r as ShortInterestEntry).short_interest) },
          { header: 'Days to Cover', render: (r) => fmtBasic((r as ShortInterestEntry).days_to_cover) },
          { header: 'Avg Daily Vol', render: (r) => fmtLarge((r as ShortInterestEntry).avg_daily_volume) },
        ]}
      />
    )
  }

  // --- Short Volume ---
  if (tab === 'short-volume') {
    const rows = data as ShortVolumeEntry[]
    return (
      <SimpleTable
        rows={rows}
        columns={[
          { header: 'Date', render: (r) => (r as ShortVolumeEntry).date },
          { header: 'Short Volume', render: (r) => fmtLarge((r as ShortVolumeEntry).short_volume) },
          { header: 'Total Volume', render: (r) => fmtLarge((r as ShortVolumeEntry).total_volume) },
          { header: 'Short Ratio', render: (r) => fmtBasic((r as ShortVolumeEntry).short_volume_ratio) },
        ]}
      />
    )
  }

  // --- Ratios (also transposed-style simple table) ---
  if (tab === 'ratios') {
    const rows = data as RatiosEntry[]
    return (
      <SimpleTable
        rows={rows}
        columns={[
          { header: 'Date', render: (r) => (r as RatiosEntry).date },
          { header: 'Market Cap', render: (r) => fmtLarge((r as RatiosEntry).market_cap) },
          { header: 'P/E', render: (r) => fmtBasic((r as RatiosEntry).price_to_earnings) },
          { header: 'P/B', render: (r) => fmtBasic((r as RatiosEntry).price_to_book) },
          { header: 'Debt/Eq.', render: (r) => fmtBasic((r as RatiosEntry).debt_to_equity) },
          { header: 'ROE', render: (r) => fmtBasic((r as RatiosEntry).return_on_equity) },
          { header: 'ROA', render: (r) => fmtBasic((r as RatiosEntry).return_on_assets) },
        ]}
      />
    )
  }

  // --- Transposed financial tables ---

  if (tab === 'income-statement') {
    const allRows = data as IncomeStatementEntry[]
    const filtered = allRows
      .filter((r) =>
        timeframe === 'annual' ? r.timeframe === 'annual' : r.timeframe === 'quarterly',
      )
      .sort((a, b) => b.period_end.localeCompare(a.period_end))
      .slice(0, 8)

    const headers = filtered.map(periodLabel)

    const metricRows: MetricRow[] = [
      {
        label: 'Revenue',
        bold: true,
        getValue: (i) => fmtLarge(filtered[i]?.revenue),
        subRows: [
          {
            label: 'YoY Growth',
            getValue: (i) => {
              const curr = filtered[i]?.revenue
              const prev = filtered[i + 1]?.revenue
              if (curr == null || prev == null || prev === 0) return '—'
              return fmtPct(((curr - prev) / Math.abs(prev)) * 100)
            },
          },
        ],
      },
      {
        label: 'Gross Profit',
        bold: true,
        getValue: (i) => fmtLarge(filtered[i]?.gross_profit),
        subRows: [
          {
            label: 'Gross Margin',
            getValue: (i) => {
              const gp = filtered[i]?.gross_profit
              const rev = filtered[i]?.revenue
              if (gp == null || rev == null || rev === 0) return '—'
              return fmtPct((gp / rev) * 100)
            },
          },
        ],
      },
      {
        label: 'Operating Income',
        bold: true,
        getValue: (i) => fmtLarge(filtered[i]?.operating_income),
        subRows: [
          {
            label: 'Operating Margin',
            getValue: (i) => {
              const op = filtered[i]?.operating_income
              const rev = filtered[i]?.revenue
              if (op == null || rev == null || rev === 0) return '—'
              return fmtPct((op / rev) * 100)
            },
          },
        ],
      },
      {
        label: 'Net Income',
        bold: true,
        getValue: (i) => fmtLarge(filtered[i]?.consolidated_net_income_loss),
      },
      {
        label: 'Diluted EPS',
        bold: false,
        getValue: (i) => fmtBasic(filtered[i]?.diluted_earnings_per_share),
      },
      {
        label: 'EBITDA',
        bold: false,
        getValue: (i) => fmtLarge(filtered[i]?.ebitda),
      },
    ]

    return <TransposedTable periodHeaders={headers} metricRows={metricRows} />
  }

  if (tab === 'balance-sheet') {
    const allRows = data as BalanceSheetEntry[]
    const filtered = allRows
      .filter((r) =>
        timeframe === 'annual' ? r.timeframe === 'annual' : r.timeframe === 'quarterly',
      )
      .sort((a, b) => b.period_end.localeCompare(a.period_end))
      .slice(0, 8)

    const headers = filtered.map(periodLabel)

    const metricRows: MetricRow[] = [
      { label: 'Total Assets', bold: true, getValue: (i) => fmtLarge(filtered[i]?.total_assets) },
      { label: 'Total Liabilities', bold: true, getValue: (i) => fmtLarge(filtered[i]?.total_liabilities) },
      { label: 'Total Equity', bold: true, getValue: (i) => fmtLarge(filtered[i]?.total_equity) },
      { label: 'Cash & Equiv.', bold: false, getValue: (i) => fmtLarge(filtered[i]?.cash_and_equivalents) },
      { label: 'LT Debt', bold: false, getValue: (i) => fmtLarge(filtered[i]?.long_term_debt_and_capital_lease_obligations) },
    ]

    return <TransposedTable periodHeaders={headers} metricRows={metricRows} />
  }

  if (tab === 'cash-flow') {
    const allRows = data as CashFlowEntry[]
    const filtered = allRows
      .filter((r) =>
        timeframe === 'annual' ? r.timeframe === 'annual' : r.timeframe === 'quarterly',
      )
      .sort((a, b) => b.period_end.localeCompare(a.period_end))
      .slice(0, 8)

    const headers = filtered.map(periodLabel)

    const metricRows: MetricRow[] = [
      { label: 'Operating CF', bold: true, getValue: (i) => fmtLarge(filtered[i]?.net_cash_from_operating_activities) },
      { label: 'CapEx', bold: false, getValue: (i) => fmtLarge(filtered[i]?.purchase_of_property_plant_and_equipment) },
      { label: 'Investing CF', bold: false, getValue: (i) => fmtLarge(filtered[i]?.net_cash_from_investing_activities) },
      { label: 'Financing CF', bold: false, getValue: (i) => fmtLarge(filtered[i]?.net_cash_from_financing_activities) },
    ]

    return <TransposedTable periodHeaders={headers} metricRows={metricRows} />
  }

  return null
}
