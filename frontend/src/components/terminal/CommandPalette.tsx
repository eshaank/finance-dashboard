import { useState, useEffect, useRef, useMemo } from 'react'
import { BarChart3, LineChart, RotateCcw, Crosshair } from 'lucide-react'
import type { WidgetTypeId } from '../../widgets'

interface Command {
  id: string
  label: string
  description: string
  icon: typeof BarChart3
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
  const panelRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => [
    {
      id: 'add-quote-monitor',
      label: 'Add Quote Monitor',
      description: 'New watchlist panel',
      icon: BarChart3,
      action: () => { onAddWidget('quote-monitor'); onClose() },
      keywords: ['add', 'quote', 'monitor', 'watchlist', 'qm'],
    },
    {
      id: 'add-price-chart',
      label: 'Add Price Chart',
      description: 'New chart panel',
      icon: LineChart,
      action: () => { onAddWidget('price-chart'); onClose() },
      keywords: ['add', 'chart', 'price', 'graph', 'g'],
    },
    {
      id: 'reset-layout',
      label: 'Reset Layout',
      description: 'Reset panels to defaults',
      icon: RotateCcw,
      action: () => { onResetLayout(); onClose() },
      keywords: ['reset', 'layout', 'default', 'restore'],
    },
    {
      id: 'go-ticker',
      label: 'Go to Ticker',
      description: '/go AAPL',
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

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

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
    <div ref={panelRef} className="fixed top-0 left-0 right-0 z-[101]">
      {/* Input bar — replaces the header */}
      <div className="h-8 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-3 gap-2">
        <span className="text-[#9a2240] text-sm font-mono font-bold shrink-0">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-[12px] font-mono text-dash-text placeholder:text-white/25 focus:outline-none"
        />
        <kbd className="px-1 py-0.5 text-[9px] font-mono text-white/30 bg-white/5 border border-white/10">
          ESC
        </kbd>
      </div>

      {/* Results dropdown */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-2xl">
        <div className="max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-center text-[11px] font-mono text-white/25">
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
                  className={`flex items-center gap-2.5 w-full px-3 h-8 text-left transition-colors cursor-pointer ${
                    i === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  <span className="text-[12px] font-mono text-dash-text">{cmd.label}</span>
                  <span className="text-[10px] font-mono text-white/20 ml-auto">{cmd.description}</span>
                </button>
              )
            })
          )}
        </div>
        {/* Footer */}
        <div className="px-3 py-1 border-t border-white/5 flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/20">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 text-[8px]">↑↓</kbd> navigate
          </span>
          <span className="text-[9px] font-mono text-white/20">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 text-[8px]">↵</kbd> select
          </span>
        </div>
      </div>
    </div>
  )
}
