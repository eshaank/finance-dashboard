import { Globe, RefreshCw, Clock } from 'lucide-react'
import { useClock } from '../../hooks/useClock'

export function Header() {
  const now = useClock()

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
          </div>
        </div>
      </div>
    </header>
  )
}
