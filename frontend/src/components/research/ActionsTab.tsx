import { useDividendHistory } from '../../hooks/useDividendHistory'
import { useSplitHistory } from '../../hooks/useSplitHistory'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/Badge'

interface ActionsTabProps {
  ticker: string
}

function formatDate(dateString: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFrequencyLabel(frequency: string): string {
  const freq = frequency?.toUpperCase() || ''
  if (freq === 'Q') return 'Quarterly'
  if (freq === 'A') return 'Annual'
  if (freq === 'M') return 'Monthly'
  if (freq === 'S') return 'Semi-Annual'
  return freq
}

export function ActionsTab({ ticker }: ActionsTabProps) {
  const {
    data: dividends,
    loading: dividendsLoading,
    error: dividendsError,
  } = useDividendHistory(ticker || null)
  const { data: splits, loading: splitsLoading, error: splitsError } = useSplitHistory(ticker || null)

  const isLoading = dividendsLoading || splitsLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="glass-card rounded-xl p-5 animate-pulse"
          aria-busy="true"
          aria-label="Loading corporate actions"
        >
          <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-5" />
          <div className="space-y-3" role="status">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.04] rounded" />
            ))}
          </div>
        </div>
        <div
          className="glass-card rounded-xl p-5 animate-pulse"
          aria-busy="true"
          aria-label="Loading split history"
        >
          <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-5" />
          <div className="space-y-3" role="status">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.04] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (dividendsError || splitsError) {
    return (
      <div
        className="glass-card rounded-xl p-8 text-center"
        role="alert"
        aria-label="Actions error"
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-dash-red/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-dash-red text-sm font-medium">Failed to load corporate actions</p>
        <p className="text-white/40 text-xs mt-2">{dividendsError || splitsError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Dividends Section */}
      <div
        className="glass-card rounded-xl p-5 animate-slide-fade"
        role="region"
        aria-label="Dividend history"
      >
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-white/30 font-medium">
            Dividend History
          </h3>
          <span className="text-xs text-white/20 font-mono">{dividends.length}</span>
        </header>

        {dividends.length === 0 ? (
          <div
            className="py-8 text-center"
            role="status"
            aria-label="No dividend history"
          >
            <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/40 text-sm">No dividend history for {ticker}</p>
            <p className="text-white/25 text-xs mt-1">This company does not pay dividends</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse" role="table" aria-label="Dividend history table">
              <thead>
                <tr className="border-b border-white/[0.10] bg-white/[0.02]">
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Ex-Date
                  </th>
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Pay Date
                  </th>
                  <th scope="col" className="text-right py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Amount
                  </th>
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {dividends.map((dividend, i) => (
                  <tr
                    key={`${dividend.ex_dividend_date}-${i}`}
                    className={cn(
                      'border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-200',
                      i % 2 === 1 && 'bg-white/[0.015]'
                    )}
                  >
                    <td className="py-2.5 px-3 text-white/70 font-mono text-xs whitespace-nowrap">
                      {formatDate(dividend.ex_dividend_date)}
                    </td>
                    <td className="py-2.5 px-3 text-white/50 font-mono text-xs whitespace-nowrap">
                      {formatDate(dividend.pay_date || '')}
                    </td>
                    <td className="py-2.5 px-3 text-[#f97316] font-mono text-xs text-right whitespace-nowrap font-medium">
                      ${dividend.cash_amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge variant="yellow" className="text-[9px] px-1.5 py-0.5">
                        {getFrequencyLabel(dividend.frequency ?? '')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Splits Section */}
      <div
        className="glass-card rounded-xl p-5 animate-slide-fade"
        role="region"
        aria-label="Split history"
      >
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-white/30 font-medium">
            Split History
          </h3>
          <span className="text-xs text-white/20 font-mono">{splits.length}</span>
        </header>

        {splits.length === 0 ? (
          <div
            className="py-8 text-center"
            role="status"
            aria-label="No split history"
          >
            <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-white/40 text-sm">No split history for {ticker}</p>
            <p className="text-white/25 text-xs mt-1">This company has not had any splits</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse" role="table" aria-label="Split history table">
              <thead>
                <tr className="border-b border-white/[0.10] bg-white/[0.02]">
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Date
                  </th>
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Ratio
                  </th>
                  <th scope="col" className="text-left py-2.5 px-3 text-xs uppercase tracking-wider text-white/30 font-medium whitespace-nowrap">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {splits.map((split, i) => {
                  const isReverse = split.is_reverse
                  const ratio = isReverse
                    ? `${split.split_from}:${split.split_to}`
                    : `${split.split_to}:${split.split_from}`

                  return (
                    <tr
                      key={`${split.execution_date}-${i}`}
                      className={cn(
                        'border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-200',
                        i % 2 === 1 && 'bg-white/[0.015]'
                      )}
                    >
                      <td className="py-2.5 px-3 text-white/70 font-mono text-xs whitespace-nowrap">
                        {formatDate(split.execution_date)}
                      </td>
                      <td
                        className={cn(
                          'py-2.5 px-3 font-mono text-xs whitespace-nowrap font-medium',
                          isReverse ? 'text-dash-red' : 'text-dash-green'
                        )}
                      >
                        {ratio}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge
                          variant={isReverse ? 'red' : 'green'}
                          className="text-[9px] px-1.5 py-0.5"
                        >
                          {isReverse ? 'RS' : 'S'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
