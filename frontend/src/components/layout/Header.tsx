import { useState, useRef, useEffect } from 'react'
import { Clock, LogOut, User } from 'lucide-react'
import { useClock } from '../../hooks/useClock'
import { useAuth } from '../../contexts/AuthContext'
import { HeaderNavTabs } from './NavTabs'
import type { TabId, ViewId } from './NavTabs'

const TZ_MAP = {
  UTC: 'UTC',
  PST: 'America/Los_Angeles',
  EST: 'America/New_York',
} as const

const TZ_OPTIONS = ['UTC', 'PST', 'EST'] as const
type TzId = (typeof TZ_OPTIONS)[number]

const HEADER_TZ_KEY = 'header-tz'
const HEADER_HOUR12_KEY = 'header-hour12'

function getStoredTz(): TzId {
  if (typeof window === 'undefined') return 'UTC'
  const stored = localStorage.getItem(HEADER_TZ_KEY)
  return TZ_OPTIONS.includes(stored as TzId) ? (stored as TzId) : 'UTC'
}

function getStoredHour12(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(HEADER_HOUR12_KEY)
  return stored === 'true'
}

interface HeaderProps {
  activeView: ViewId
  onTabChange: (tab: TabId) => void
  onGoHome: () => void
}

export function Header({ activeView, onTabChange, onGoHome }: HeaderProps) {
  const now = useClock()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tzMenuOpen, setTzMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const tzRef = useRef<HTMLDivElement>(null)
  const [tz, setTz] = useState<TzId>(() => getStoredTz())
  const [use12h, setUse12h] = useState<boolean>(() => getStoredHour12())

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false)
      }
      if (tzRef.current && !tzRef.current.contains(target)) {
        setTzMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const tzId = TZ_MAP[tz]
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: use12h,
    timeZone: tzId,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: tzId,
  })

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? 'User'

  return (
    <header className="border-b border-white/5 bg-dash-surface/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-4 py-2 md:px-6">
        <div className="flex items-center justify-between gap-4">

          {/* Brand */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onGoHome()
              if (activeView === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="flex shrink-0 items-center gap-2.5 rounded-md py-1 pr-2 transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-dash-surface cursor-pointer"
            aria-label="Go to dashboard home"
          >
            <img src="/logo.svg" alt="3Epsilon" className="w-7 h-7 rounded-md" />
            <span className="hidden sm:block text-sm font-medium tracking-wide text-dash-text/90">
              3Epsilon
            </span>
          </button>

          {/* Nav */}
          <HeaderNavTabs
            activeTab={activeView === 'home' ? null : activeView}
            onTabChange={onTabChange}
          />

          {/* Right controls */}
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {activeView === 'home' && (
              <div id="dashboard-controls" className="flex items-center gap-1.5" />
            )}

            {/* Clock + timezone */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-dash-surface-2/60 relative" ref={tzRef}>
              <Clock className="w-3 h-3 text-accent/70 cursor-pointer" onClick={() => setTzMenuOpen((o) => !o)} />
              <span className="font-mono text-xs text-dash-text/70">{timeStr}</span>
              <span className="text-xs text-white/25">{tz}</span>
              {tzMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 py-1 bg-dash-surface border border-white/10 rounded-lg shadow-xl z-50 min-w-[80px]"
                  role="listbox"
                  aria-label="Timezone and format"
                >
                  {TZ_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={option === tz}
                      onClick={() => {
                        setTz(option)
                        localStorage.setItem(HEADER_TZ_KEY, option)
                        setTzMenuOpen(false)
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-white/5 transition-colors ${option === tz ? 'text-accent' : 'text-white/70'}`}
                    >
                      {option}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-1" aria-hidden />
                  <div className="px-3 py-1.5 text-xs text-white/40">Format</div>
                  <div className="flex gap-1 px-2 pb-1">
                    <button
                      type="button"
                      onClick={() => { setUse12h(false); localStorage.setItem(HEADER_HOUR12_KEY, 'false') }}
                      className={`flex-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${!use12h ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-white/5'}`}
                    >
                      24h
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUse12h(true); localStorage.setItem(HEADER_HOUR12_KEY, 'true') }}
                      className={`flex-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${use12h ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-white/5'}`}
                    >
                      12h
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <span className="hidden md:block text-xs text-white/30">{dateStr}</span>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-dash-surface-2/60 hover:bg-dash-surface-2/80 transition-colors cursor-pointer"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white/50" />
                )}
                <span className="hidden sm:block text-xs text-white/60 max-w-[100px] truncate">
                  {displayName}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-dash-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs text-white/40">Signed in as</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-dash-green pulse-dot" />
                        <span className="text-xs text-white/40">Live</span>
                      </div>
                    </div>
                    <p className="text-sm text-dash-text truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); signOut() }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}
