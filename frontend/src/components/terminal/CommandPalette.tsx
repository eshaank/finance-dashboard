import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, BarChart3, LineChart, RotateCcw, Crosshair } from 'lucide-react'
import type { WidgetTypeId } from '../../widgets'

interface Command {
  id: string
  label: string
  description: string
  icon: typeof Search
  action: () => void
  keywords: string[]
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onAddWidget: (type: WidgetTypeId) => void
  onSetTicker: (ticker: string) => void
  onResetLayout: () => void
}

export function CommandPalette({
  open,
  onClose,
  onAddWidget,
  onSetTicker,
  onResetLayout,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = useMemo<Command[]>(() => [
    {
      id: 'add-quote-monitor',
      label: 'Add Quote Monitor',
      description: 'Add a new watchlist panel',
      icon: BarChart3,
      action: () => { onAddWidget('quote-monitor'); onClose() },
      keywords: ['add', 'quote', 'monitor', 'watchlist', 'qm'],
    },
    {
      id: 'add-price-chart',
      label: 'Add Price Chart',
      description: 'Add a new chart panel',
      icon: LineChart,
      action: () => { onAddWidget('price-chart'); onClose() },
      keywords: ['add', 'chart', 'price', 'graph', 'g'],
    },
    {
      id: 'reset-layout',
      label: 'Reset Layout',
      description: 'Reset all panels to default positions',
      icon: RotateCcw,
      action: () => { onResetLayout(); onClose() },
      keywords: ['reset', 'layout', 'default', 'restore'],
    },
    {
      id: 'go-ticker',
      label: 'Go to Ticker',
      description: 'Switch to a specific ticker (type: /go AAPL)',
      icon: Crosshair,
      action: () => {
        const parts = query.split(/\s+/)
        const ticker = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : ''
        if (ticker && /^[A-Z]{1,5}$/.test(ticker)) {
          onSetTicker(ticker)
        }
        onClose()
      },
      keywords: ['go', 'ticker', 'symbol', 'switch', 'navigate'],
    },
  ], [onAddWidget, onClose, onResetLayout, onSetTicker, query])

  const filtered = useMemo(() => {
    const q = query.replace(/^\//, '').toLowerCase().trim()
    if (!q) return commands

    const parts = q.split(/\s+/)
    const searchTerm = parts[0]

    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(searchTerm) ||
      cmd.keywords.some((kw) => kw.includes(searchTerm)),
    )
  }, [query, commands])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  useEffect(() => {
    if (open) {
      setQuery('/')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md z-[101] animate-slide-fade">
        <div className="bg-dash-surface border border-dash-border shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-dash-border">
            <Search className="w-4 h-4 text-dash-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-sm font-mono text-dash-text placeholder:text-dash-muted/50 focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-dash-muted bg-white/5 border border-dash-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-dash-muted">
                No matching commands
              </div>
            ) : (
              filtered.map((cmd, i) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                      i === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-dash-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-dash-text block">{cmd.label}</span>
                      <span className="text-[11px] text-dash-muted block truncate">{cmd.description}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-dash-border flex items-center gap-3">
            <span className="text-[10px] font-mono text-dash-muted/50">
              <kbd className="px-1 py-0.5 bg-white/5 border border-dash-border text-[9px]">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] font-mono text-dash-muted/50">
              <kbd className="px-1 py-0.5 bg-white/5 border border-dash-border text-[9px]">↵</kbd> select
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
