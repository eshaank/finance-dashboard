import { useState, useRef, useEffect } from 'react'
import { Globe, RefreshCw, Clock, LogOut, User } from 'lucide-react'
import { useClock } from '../../hooks/useClock'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const now = useClock()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? 'User'

  return (
    <header className="border-b border-white/5 bg-dash-surface/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center accent-glow">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold tracking-tight text-dash-text">
                Global Economic Dashboard
              </h1>
              <p className="text-xs text-white/40">Market Intelligence Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dash-surface-2/60">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="font-mono text-sm text-dash-text/80">{timeStr}</span>
              <span className="text-xs text-white/30">UTC</span>
            </div>

            <div className="flex items-center gap-2 text-white/30">
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs">{dateStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-dash-green pulse-dot" />
              <span className="text-xs text-white/50">Live</span>
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dash-surface-2/60 hover:bg-dash-surface-2/80 transition-colors cursor-pointer"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-white/50" />
                )}
                <span className="text-xs text-white/60 max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-dash-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-white/40">Signed in as</p>
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
