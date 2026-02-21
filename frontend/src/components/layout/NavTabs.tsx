export type TabId = 'scanner' | 'us-economics' | 'research' | 'global-economics'

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

export const TABS: Tab[] = [
  { id: 'global-economics', label: 'Global Economics' },
  { id: 'us-economics', label: 'US Economics' },
  { id: 'scanner', label: 'Scanner' },
  { id: 'analysis', label: 'Analysis', soon: true },
  { id: 'research', label: 'Research' },
]

interface HeaderNavTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

/** Tab buttons for use inside the header (single bar). */
export function HeaderNavTabs({ activeTab, onTabChange }: HeaderNavTabsProps) {
  return (
    <div className="flex items-center gap-1 min-w-0 flex-1 justify-center">
      {TABS.map((tab) => {
        const isSoon = tab.soon === true
        const isActive = !isSoon && tab.id === activeTab

        return (
          <button
            key={tab.id}
            onClick={() => !isSoon && onTabChange(tab.id as TabId)}
            disabled={isSoon}
            className={[
              'relative shrink-0 px-3 py-2 text-sm font-medium transition-colors duration-150',
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
  )
}
