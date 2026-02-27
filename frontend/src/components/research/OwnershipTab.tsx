import { useState } from 'react'
import { useFundamentals } from '../../hooks/useFundamentals'
import { cn } from '../../lib/utils'
import { SubTabNav } from './SubTabNav'
import type { ShortInterestEntry, FloatData } from '../../types'

type OwnershipSubTab = 'short-interest' | 'float'

const OWNERSHIP_TABS: { id: OwnershipSubTab; label: string }[] = [
  { id: 'short-interest', label: 'Short Interest' },
  { id: 'float', label: 'Float' },
]

interface OwnershipTabProps {
  ticker: string
}

function fmtLarge(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`
  return v.toLocaleString()
}

function formatDate(dateString: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function OwnershipTab({ ticker }: OwnershipTabProps) {
  const [activeTab, setActiveTab] = useState<OwnershipSubTab>('short-interest')
  const {
    data: shortInterestData,
    loading: shortInterestLoading,
    error: shortInterestError,
  } = useFundamentals(ticker, 'short-interest')
  const { data: floatData, loading: floatLoading, error: floatError } = useFundamentals(
    ticker,
    'float'
  )

  const renderShortInterestTable = () => {
    if (!shortInterestData || !Array.isArray(shortInterestData) || shortInterestData.length === 0) {
      return (
        <div className="py-8 text-center" role="status" aria-label="No short interest data">
          <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-white/40 text-sm">No short interest data available</p>
          <p className="text-white/25 text-xs mt-1">Data may be delayed or unavailable</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" role="table" aria-label="Short interest data">
          <thead>
            <tr className="border-b border-white/[0.10] bg-white/[0.02]">
              <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                Settlement Date
              </th>
              <th scope="col" className="text-right py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                Short Interest
              </th>
              <th scope="col" className="text-right py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                Days to Cover
              </th>
              <th scope="col" className="text-right py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                Avg Daily Vol
              </th>
            </tr>
          </thead>
          <tbody>
            {(shortInterestData as ShortInterestEntry[]).map((row, i) => (
              <tr
                key={row.settlement_date}
                className={cn(
                  'border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-200',
                  i % 2 === 1 && 'bg-white/[0.015]'
                )}
              >
                <td className="py-2.5 px-3 text-white/70 font-mono text-xs whitespace-nowrap">
                  {formatDate(row.settlement_date)}
                </td>
                <td className="py-2.5 px-3 text-white/70 font-mono text-xs text-right whitespace-nowrap">
                  {fmtLarge(row.short_interest)}
                </td>
                <td className="py-2.5 px-3 text-white/70 font-mono text-xs text-right whitespace-nowrap">
                  {row.days_to_cover?.toFixed(2) || '—'}
                </td>
                <td className="py-2.5 px-3 text-white/70 font-mono text-xs text-right whitespace-nowrap">
                  {fmtLarge(row.avg_daily_volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderFloatSection = () => {
    if (!floatData || typeof floatData !== 'object') {
      return (
        <div className="py-8 text-center" role="status" aria-label="No float data">
          <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-white/40 text-sm">No float data available</p>
          <p className="text-white/25 text-xs mt-1">Data may be delayed or unavailable</p>
        </div>
      )
    }

    const f = floatData as FloatData

    return (
      <div className="flex flex-col gap-5 py-2">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Free Float', value: f.free_float?.toLocaleString() ?? '—' },
            {
              label: 'Float %',
              value: f.free_float_percent !== null ? `${f.free_float_percent?.toFixed(2)}%` : '—',
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className={cn(
                'bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-xl px-5 py-4',
                'border border-white/[0.07]',
                'transition-all duration-200 hover:border-white/[0.12]'
              )}
            >
              <p className="text-xs text-white/40 mb-1.5">{label}</p>
              <p className="text-xl font-display font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        {f.effective_date && (
          <p className="text-xs text-white/30 font-mono">As of {formatDate(f.effective_date)}</p>
        )}
      </div>
    )
  }

  if (shortInterestLoading || floatLoading) {
    return (
      <div
        className="glass-card rounded-xl p-5 animate-pulse"
        aria-busy="true"
        aria-label="Loading ownership data"
      >
        <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-5" />
        <div className="h-8 bg-white/[0.04] rounded w-1/3 mb-4" />
        <div className="space-y-3" role="status">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.04] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (shortInterestError || floatError) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="alert"
        aria-label="Ownership data error"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-dash-red/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-dash-red text-sm font-medium">Failed to load ownership data</p>
        <p className="text-white/40 text-xs mt-2">{shortInterestError || floatError}</p>
      </div>
    )
  }

  return (
    <div
      className="glass-card rounded-xl p-5 flex flex-col gap-4 animate-slide-fade"
      role="region"
      aria-label="Ownership information"
    >
      <header className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-white/30 font-medium">
          {OWNERSHIP_TABS.find((t) => t.id === activeTab)?.label ?? 'Ownership Data'}
        </h3>
      </header>

      <SubTabNav
        tabs={OWNERSHIP_TABS}
        active={activeTab}
        onSelect={(id) => setActiveTab(id as OwnershipSubTab)}
      />

      <div role="tabpanel" aria-label={OWNERSHIP_TABS.find((t) => t.id === activeTab)?.label}>
        {activeTab === 'short-interest' ? renderShortInterestTable() : renderFloatSection()}
      </div>
    </div>
  )
}
