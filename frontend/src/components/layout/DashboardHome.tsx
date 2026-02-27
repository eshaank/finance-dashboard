import { useState, useEffect, useCallback, useRef } from 'react'
import { BarChart3, LineChart } from 'lucide-react'
import { useWidgetDashboard, TerminalWorkspace } from '../../widgets'
import type { WidgetTypeId } from '../../widgets'
import { CommandPalette } from '../terminal/CommandPalette'

interface DashboardHomeProps {
  onAddWidgetClick?: (handler: () => void) => void
  onCommandPaletteOpen?: (handler: () => void) => void
  onRegisterAddWidget?: (handler: (type: WidgetTypeId) => void) => void
}

export function DashboardHome({ onAddWidgetClick, onCommandPaletteOpen, onRegisterAddWidget }: DashboardHomeProps) {
  const {
    widgets,
    isEditing,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateWidgetPosition,
    resetToDefault,
    focusedWidgetId,
    setFocusedWidgetId,
    broadcastTicker,
    setTickerForFocused,
    setLinkChannel,
  } = useWidgetDashboard()

  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  const openAddMenu = useCallback(() => setAddMenuOpen(true), [])
  const openPalette = useCallback(() => setPaletteOpen(true), [])

  // Expose handlers to parent via callbacks
  useEffect(() => {
    onAddWidgetClick?.(openAddMenu)
  }, [onAddWidgetClick, openAddMenu])

  useEffect(() => {
    onCommandPaletteOpen?.(openPalette)
  }, [onCommandPaletteOpen, openPalette])

  useEffect(() => {
    onRegisterAddWidget?.(addWidget)
  }, [onRegisterAddWidget, addWidget])

  // Global "/" keypress to open command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '/') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close add menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false)
      }
    }
    if (addMenuOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [addMenuOpen])

  function handleAddWidget(type: WidgetTypeId) {
    addWidget(type)
    setAddMenuOpen(false)
  }

  return (
    <main className="terminal-workspace">
      <TerminalWorkspace
        widgets={widgets}
        isEditing={isEditing}
        onPositionChange={updateWidgetPosition}
        onRemove={removeWidget}
        onConfigChange={updateWidgetConfig}
        onFocusChange={setFocusedWidgetId}
        onBroadcastTicker={broadcastTicker}
        onSetLinkChannel={setLinkChannel}
      />

      {/* Add widget dropdown — positioned at top center */}
      {addMenuOpen && (
        <div
          ref={addMenuRef}
          className="fixed top-10 left-1/2 -translate-x-1/2 z-[90] bg-dash-surface border border-dash-border shadow-2xl w-56 animate-slide-fade"
        >
          <div className="px-3 py-2 border-b border-dash-border">
            <span className="text-[10px] font-mono uppercase tracking-wider text-dash-muted">Add Widget</span>
          </div>
          <div className="py-1">
            <button
              onClick={() => handleAddWidget('quote-monitor')}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-dash-muted" />
              <div>
                <span className="text-sm text-dash-text block">Quote Monitor</span>
                <span className="text-[11px] text-dash-muted">Watchlist panel</span>
              </div>
            </button>
            <button
              onClick={() => handleAddWidget('price-chart')}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <LineChart className="w-4 h-4 text-dash-muted" />
              <div>
                <span className="text-sm text-dash-text block">Price Chart</span>
                <span className="text-[11px] text-dash-muted">Chart panel</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAddWidget={addWidget}
        onSetTicker={setTickerForFocused}
        onResetLayout={resetToDefault}
      />
    </main>
  )
}
