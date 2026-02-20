type TabId = 'scanner' | 'overview'

interface ActiveTab {
  id: TabId
  label: string
  soon?: never
}

interface SoonTab {
  id: string
  label: string
  soon: true
}

type Tab = ActiveTab | SoonTab

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'scanner', label: 'Scanner' },
  { id: 'analysis', label: 'Analysis', soon: true },
  { id: 'research', label: 'Research', soon: true },
]

interface NavTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <nav className="border-b border-white/5 bg-dash-surface/50 backdrop-blur-xl sticky top-[73px] z-40">
      <div className="px-6 flex items-center gap-1">
        {TABS.map((tab) => {
          const isSoon = tab.soon === true
          const isActive = !isSoon && tab.id === activeTab

          return (
            <button
              key={tab.id}
              onClick={() => !isSoon && onTabChange(tab.id as TabId)}
              disabled={isSoon}
              className={[
                'relative px-4 py-3 text-sm font-medium transition-colors duration-150',
                isSoon
                  ? 'opacity-40 cursor-not-allowed text-white/40'
                  : isActive
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70 cursor-pointer',
              ].join(' ')}
            >
              {tab.label}
              {isSoon && (
                <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/30">
                  soon
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
