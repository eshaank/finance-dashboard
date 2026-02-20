import type { CompanyDetails, InsideDayResult } from '../../types'
import { PriceChart } from './PriceChart'

function fmtLarge(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`
  return `${sign}${(abs / 1e3).toFixed(2)}K`
}

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
      <p className="text-xs text-white/40 mb-0.5">{label}</p>
      <p className="text-sm font-display font-semibold text-white">{value}</p>
    </div>
  )
}

interface Props {
  ticker: string
  priceData: InsideDayResult | null
  priceLoading: boolean
  company: CompanyDetails | null
  companyLoading: boolean
}

export function OverviewSection({ ticker, priceData, priceLoading, company, companyLoading }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 items-start">
      {/* Left: Price chart */}
      <div className="glass-card p-4">
        <PriceChart
          ticker={ticker}
          bars={priceData?.bars ?? []}
          latestClose={priceData?.latest_close}
          loading={priceLoading}
        />
      </div>

      {/* Right: Company details card */}
      <div className="glass-card p-4 space-y-4">
        {companyLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}
        {!companyLoading && !company && (
          <p className="text-white/30 text-sm">No company data available.</p>
        )}
        {company && (
          <>
            {company.description && (
              <p className="text-xs text-white/50 leading-relaxed line-clamp-4">
                {company.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {company.market_cap != null && (
                <StatCard label="Mkt Cap" value={fmtLarge(company.market_cap)} />
              )}
              {company.total_employees != null && (
                <StatCard label="Employees" value={company.total_employees.toLocaleString()} />
              )}
            </div>
            {company.homepage_url && (
              <a
                href={company.homepage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
              >
                {company.homepage_url.replace(/^https?:\/\//, '')} ↗
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
