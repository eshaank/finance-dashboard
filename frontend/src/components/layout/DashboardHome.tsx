/**
 * Dashboard home — customizable landing page (placeholder).
 * In the future: user-configured widgets (company search, SEC filings, index prices, US economic calendar, etc.).
 */
export function DashboardHome() {
  return (
    <main className="p-6 animate-fade-in">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-dash-surface/60 p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-dash-text mb-2">
          Your dashboard
        </h2>
        <p className="text-sm text-white/60 mb-6">
          Customize this page with widgets — company financials, SEC filings, index prices, upcoming US economic data, and more. Coming soon.
        </p>
        <p className="text-xs text-white/40">
          Use the tabs above to explore Global Economics, US Economics, Scanner, and Research.
        </p>
      </div>
    </main>
  )
}
