import { useSecFilings } from '../../hooks/useSecFilings'
import { cn } from '../../lib/utils'
import type { SecFilingItem } from '../../types'

interface FilingsTabProps {
  ticker: string
}

function formatDate(dateString: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFilingBadgeColor(filingType: string): {
  bg: string
  text: string
  border: string
} {
  const type = filingType.toUpperCase()
  if (type === '10-K') {
    return {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    }
  }
  if (type === '10-Q') {
    return {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
    }
  }
  return {
    bg: 'bg-white/5',
    text: 'text-white/50',
    border: 'border-white/10',
  }
}

function groupByYear(filings: SecFilingItem[]): Record<string, SecFilingItem[]> {
  return filings.reduce(
    (acc, filing) => {
      const year = new Date(filing.filing_date).getFullYear().toString()
      if (!acc[year]) acc[year] = []
      acc[year].push(filing)
      return acc
    },
    {} as Record<string, SecFilingItem[]>
  )
}

export function FilingsTab({ ticker }: FilingsTabProps) {
  const { data: filings, loading, error } = useSecFilings(ticker || null)

  if (loading) {
    return (
      <div
        className="glass-card rounded-xl p-5 animate-pulse"
        aria-busy="true"
        aria-label="Loading SEC filings"
      >
        <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-5" />
        <div className="space-y-4" role="status">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.04] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="alert"
        aria-label="Filings error"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-dash-red/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-dash-red text-sm font-medium">Failed to load SEC filings</p>
        <p className="text-white/40 text-xs mt-2">{error}</p>
      </div>
    )
  }

  if (!filings || filings.length === 0) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="status"
        aria-label="No filings available"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-white/50 text-sm">No SEC filings available</p>
        <p className="text-white/30 text-xs mt-1">Check back later for updates</p>
      </div>
    )
  }

  const groupedFilings = groupByYear(filings)
  const sortedYears = Object.keys(groupedFilings).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div
      className="glass-card rounded-xl p-5 animate-slide-fade"
      role="region"
      aria-label="SEC filings"
    >
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-white/30 font-medium">
          SEC Filings
        </h3>
        <span className="text-xs text-white/20 font-mono">{filings.length}</span>
      </header>

      <div className="mt-4 space-y-6">
        {sortedYears.map((year) => (
          <section key={year} aria-label={`Filings from ${year}`}>
            <h4 className="text-xs font-medium text-white/40 mb-2 sticky top-0 bg-dash-surface/95 py-1">
              {year}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" role="table" aria-label={`SEC filings from ${year}`}>
                <thead>
                  <tr className="border-b border-white/[0.10] bg-white/[0.02]">
                    <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                      Type
                    </th>
                    <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                      Filing Date
                    </th>
                    <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                      Period
                    </th>
                    <th scope="col" className="text-center py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedFilings[year].map((filing, i) => {
                    const colors = getFilingBadgeColor(filing.filing_type)
                    return (
                      <tr
                        key={`${filing.filing_date}-${i}`}
                        className={cn(
                          'border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-200',
                          i % 2 === 1 && 'bg-white/[0.015]'
                        )}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium font-mono border',
                              colors.bg,
                              colors.text,
                              colors.border
                            )}
                          >
                            {filing.filing_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white/70 font-mono text-xs whitespace-nowrap">
                          {formatDate(filing.filing_date)}
                        </td>
                        <td className="py-2.5 px-3 text-white/50 font-mono text-xs whitespace-nowrap">
                          {filing.period_of_report_date
                            ? formatDate(filing.period_of_report_date)
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <a
                            href={filing.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'inline-flex items-center justify-center p-1.5 rounded',
                              'text-white/40 hover:text-accent transition-colors duration-200',
                              'focus:outline-none focus:ring-2 focus:ring-accent/50'
                            )}
                            aria-label={`View ${filing.filing_type} filing on SEC.gov`}
                            title="View on SEC.gov"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
