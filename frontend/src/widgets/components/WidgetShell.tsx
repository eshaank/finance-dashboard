import { memo } from 'react'
import { GripVertical, X } from 'lucide-react'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { getWidgetDefinition } from '../registry'
import type { WidgetInstance, WidgetProps } from '../types'

interface WidgetShellProps {
  widget: WidgetInstance
  isEditing: boolean
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
}

export const WidgetShell = memo(function WidgetShell({
  widget,
  isEditing,
  onRemove,
  onConfigChange,
}: WidgetShellProps) {
  const def = getWidgetDefinition(widget.type)
  if (!def) return null

  const Component = def.component

  const widgetProps: WidgetProps = {
    id: widget.id,
    config: widget.config,
    onConfigChange: (config) => onConfigChange(widget.id, config),
    onRemove: () => onRemove(widget.id),
    isEditing,
    isFocused: false,
    linkChannel: null,
  }

  return (
    <div className="h-full flex flex-col glass-card rounded overflow-hidden group">
      <div className="shrink-0 flex items-center gap-2 px-1.5 py-0.5 border-b border-white/5">
        <div className="widget-drag-handle cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 text-white/20 hover:text-white/40 transition-colors">
          <GripVertical className="w-3 h-3" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium flex-1">
          {def.name}
        </span>
        <button
          onClick={() => onRemove(widget.id)}
          className={`p-1 rounded-md text-white/20 hover:text-dash-red hover:bg-white/5 transition-colors ${
            isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label={`Remove ${def.name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 p-1.5 overflow-hidden">
        <ErrorBoundary>
          <Component {...widgetProps} />
        </ErrorBoundary>
      </div>
    </div>
  )
})
