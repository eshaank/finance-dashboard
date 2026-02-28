import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export type TabId = 'us-economics' | 'markets' | 'polymarket' | 'research' | 'scanner'

/** Current view: dashboard home, terminal workspace, or a nav tab. */
export type ViewId = 'home' | 'terminal' | TabId

interface NavItem {
  id: TabId | string
  label: string
  soon?: boolean
}

interface DirectCategory {
  type: 'direct'
  label: string
  tabId: TabId
}

interface DropdownCategory {
  type: 'dropdown'
  label: string
  items: NavItem[]
}

type NavCategory = DirectCategory | DropdownCategory

const NAV_CATEGORIES: NavCategory[] = [
  {
    type: 'dropdown',
    label: 'Economy',
    items: [
      { id: 'us-economics', label: 'US Economics' },
      { id: 'global-economics', label: 'Global Economics', soon: true },
    ],
  },
  {
    type: 'dropdown',
    label: 'Markets',
    items: [
      { id: 'markets', label: 'US Markets' },
      { id: 'polymarket', label: 'Polymarket' },
    ],
  },
  { type: 'direct', label: 'Research', tabId: 'research' },
  {
    type: 'dropdown',
    label: 'Trading',
    items: [
      { id: 'scanner', label: 'Scanner' },
      { id: 'backtesting', label: 'Backtesting', soon: true },
      { id: 'charting', label: 'Charting', soon: true },
    ],
  },
]

function isCategoryActive(cat: NavCategory, activeTab: TabId | null): boolean {
  if (!activeTab) return false
  if (cat.type === 'direct') return cat.tabId === activeTab
  return cat.items.some((item) => item.id === activeTab)
}

interface HeaderNavTabsProps {
  /** null when viewing the dashboard home (no tab selected). */
  activeTab: TabId | null
  onTabChange: (tab: TabId) => void
}

/** Category-based nav for the header. */
export function HeaderNavTabs({ activeTab, onTabChange }: HeaderNavTabsProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={navRef}
      className="relative z-0 flex min-w-0 flex-1 items-center justify-center gap-1"
    >
      {NAV_CATEGORIES.map((cat) => {
        const active = isCategoryActive(cat, activeTab)

        if (cat.type === 'direct') {
          return (
            <button
              key={cat.label}
              onClick={() => {
                setOpenDropdown(null)
                onTabChange(cat.tabId)
              }}
              className={[
                'relative whitespace-nowrap px-2.5 py-2 text-xs sm:px-3 sm:text-sm font-medium transition-colors duration-150 cursor-pointer',
                active
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70',
              ].join(' ')}
            >
              {cat.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </button>
          )
        }

        const isOpen = openDropdown === cat.label
        return (
          <div key={cat.label} className="relative">
            <button
              onClick={() => setOpenDropdown(isOpen ? null : cat.label)}
              className={[
                'relative flex items-center gap-1 whitespace-nowrap px-2.5 py-2 text-xs sm:px-3 sm:text-sm font-medium transition-colors duration-150 cursor-pointer',
                active
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70',
              ].join(' ')}
            >
              {cat.label}
              <ChevronDown
                className={[
                  'w-3 h-3 transition-transform duration-150',
                  isOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full mt-1 min-w-[180px] py-1 bg-dash-surface border border-white/10 rounded-lg shadow-xl z-50">
                {cat.items.map((item) => {
                  const isSoon = item.soon === true
                  const isItemActive = !isSoon && activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isSoon) {
                          onTabChange(item.id as TabId)
                          setOpenDropdown(null)
                        }
                      }}
                      disabled={isSoon}
                      className={[
                        'flex items-center justify-between w-full text-left px-3 py-2 text-sm transition-colors',
                        isSoon
                          ? 'opacity-40 cursor-not-allowed text-white/40'
                          : isItemActive
                            ? 'text-accent bg-white/5'
                            : 'text-white/70 hover:text-white hover:bg-white/5 cursor-pointer',
                      ].join(' ')}
                    >
                      {item.label}
                      {isSoon && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
                          soon
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
