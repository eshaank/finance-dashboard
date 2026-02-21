import { useState } from 'react'
import type { ChartTimeframe, CompanyDetails, OHLCBar } from '../../types'
import { cn } from '../../lib/utils'
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
  accentColor?: string
}

function StatCard({ label, value, accentColor = 'border-l-accent/60' }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl px-4 py-3 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.07] border-l-2',
      accentColor,
    )}>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-lg font-display font-semibold text-white">{value}</p>
    </div>
  )
}

interface Props {
  ticker: string
  chartBars: OHLCBar[]
  chartLoading: boolean
  chartLatestClose?: number
  chartTimeframe: ChartTimeframe
  onChartTimeframeChange: (tf: ChartTimeframe) => void
  company: CompanyDetails | null
  companyLoading: boolean
}

export function OverviewSection({
  ticker,
  chartBars,
  chartLoading,
  chartLatestClose,
  chartTimeframe,
  onChartTimeframeChange,
  company,
  companyLoading,
}: Props) {
  const [showFullDesc, setShowFullDesc] = useState(false)
  const bars = chartBars
  const isUp = bars.length < 2 ? true : bars[bars.length - 1].close >= bars[bars.length - 2].close

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 items-start">
      {/* Left: Price chart */}
      <div
        className={cn(
          'glass-card rounded-xl p-5 border-l-2',
          bars.length >= 2
            ? isUp
              ? 'border-l-emerald-500/60'
              : 'border-l-rose-500/60'
            : 'border-l-transparent',
        )}
      >
        <PriceChart
          ticker={ticker}
          bars={bars}
          latestClose={chartLatestClose}
          loading={chartLoading}
          timeframe={chartTimeframe}
          onTimeframeChange={onChartTimeframeChange}
        />
      </div>

      {/* Right: Company details card */}
      <div className="glass-card rounded-xl p-5 space-y-5">
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
          <div className="animate-fade-in">
            {/* Company identity row */}
            <div className="flex items-center gap-3 flex-wrap">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-8 w-8 object-contain rounded-sm shrink-0"
                />
              )}
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">{company.name}</span>
                <span className="text-xs font-mono text-white/40">{ticker}</span>
              </div>
              {company.primary_exchange && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-accent/20 border border-accent/30 text-accent-light">
                  {company.primary_exchange}
                </span>
              )}
            </div>

            {company.sic_description && (
              <div className="mt-3">
                <span className="px-2.5 py-1 rounded-full text-xs bg-white/[0.06] border border-white/[0.08] text-white/50">
                  {company.sic_description}
                </span>
              </div>
            )}

            {company.description && (
              <div className="mt-4">
                <p className={cn(
                  'text-sm text-white/60 leading-relaxed',
                  !showFullDesc && 'line-clamp-6',
                )}>
                  {company.description}
                </p>
                {company.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-1.5 text-xs text-accent-light hover:text-white/70 transition-colors"
                  >
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              {company.market_cap != null && (
                <StatCard label="Mkt Cap" value={fmtLarge(company.market_cap)} accentColor="border-l-emerald-500/40" />
              )}
              {company.total_employees != null && (
                <StatCard label="Employees" value={company.total_employees.toLocaleString()} accentColor="border-l-blue-500/40" />
              )}
            </div>

            {company.homepage_url && (
              <a
                href={company.homepage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/70 transition-all font-mono"
              >
                {company.homepage_url.replace(/^https?:\/\//, '')}
                <span className="text-white/30">↗</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
