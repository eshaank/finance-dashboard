import { memo } from 'react'
import { X, Link } from 'lucide-react'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { getWidgetDefinition } from '../registry'
import type { WidgetInstance, WidgetProps } from '../types'

interface TerminalPanelProps {
  widget: WidgetInstance
  isEditing: boolean
  isFocused: boolean
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
  onFocus: (id: string) => void
  linkedTicker: string
  onLinkedTickerChange: (ticker: string) => void
}

export const TerminalPanel = memo(function TerminalPanel({
  widget,
  isEditing,
  isFocused,
  onRemove,
  onConfigChange,
  onFocus,
  linkedTicker,
  onLinkedTickerChange,
}: TerminalPanelProps) {
  const def = getWidgetDefinition(widget.type)
  if (!def) return null

  const Component = def.component

  const widgetProps: WidgetProps = {
    id: widget.id,
    config: widget.config,
    onConfigChange: (config) => onConfigChange(widget.id, config),
    onRemove: () => onRemove(widget.id),
    isEditing,
    linkedTicker,
    onLinkedTickerChange,
  }

  return (
    <div
      className={`terminal-panel flex flex-col ${isFocused ? 'is-focused' : ''}`}
      onMouseDown={() => onFocus(widget.id)}
    >
      <div className="terminal-panel-header shrink-0 flex items-center gap-2 px-2 h-7 bg-dash-panel-header">
        <span className="drag-handle flex-1 text-[10px] uppercase tracking-widest text-white/30 font-mono font-medium">
          {def.name}
        </span>
        <button
          className="p-0.5 text-white/20 hover:text-accent-blue transition-colors"
          title="Linked"
        >
          <Link className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRemove(widget.id)}
          className={`p-0.5 text-white/20 hover:text-dash-red transition-colors ${
            isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label={`Remove ${def.name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden bg-dash-surface">
        <ErrorBoundary>
          <Component {...widgetProps} />
        </ErrorBoundary>
      </div>
    </div>
  )
})
