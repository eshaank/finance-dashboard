import { memo, useState, useRef, useEffect } from 'react'
import { X, Link } from 'lucide-react'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { getWidgetDefinition } from '../registry'
import { LINK_CHANNEL_COLORS } from '../types'
import type { WidgetInstance, WidgetProps, LinkChannel } from '../types'

const CHANNEL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const

interface TerminalPanelProps {
  widget: WidgetInstance
  isEditing: boolean
  isFocused: boolean
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
  onFocus: (id: string) => void
  onBroadcastTicker: (sourceWidgetId: string, ticker: string) => void
  onSetLinkChannel: (id: string, channel: LinkChannel) => void
}

export const TerminalPanel = memo(function TerminalPanel({
  widget,
  isEditing,
  isFocused,
  onRemove,
  onConfigChange,
  onFocus,
  onBroadcastTicker,
  onSetLinkChannel,
}: TerminalPanelProps) {
  const def = getWidgetDefinition(widget.type)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  if (!def) return null

  const Component = def.component
  const channelColor = widget.linkChannel !== null
    ? LINK_CHANNEL_COLORS[widget.linkChannel]
    : undefined

  const widgetProps: WidgetProps = {
    id: widget.id,
    config: widget.config,
    onConfigChange: (config) => onConfigChange(widget.id, config),
    onRemove: () => onRemove(widget.id),
    isEditing,
    isFocused,
    linkChannel: widget.linkChannel,
    onTickerChange: (ticker: string) => onBroadcastTicker(widget.id, ticker),
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
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen((p) => !p)}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-0.5 transition-colors cursor-pointer"
            style={{ color: channelColor ?? 'rgba(255,255,255,0.2)' }}
            title={widget.linkChannel !== null ? `Link channel ${widget.linkChannel} — click to change` : 'Unlinked — click to link'}
          >
            <Link className="w-3 h-3" />
          </button>
          {pickerOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 shadow-2xl"
              style={{ padding: '6px' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex gap-[3px]">
                {CHANNEL_OPTIONS.map((ch) => {
                  const isActive = widget.linkChannel === ch
                  return (
                    <button
                      key={ch}
                      onClick={() => {
                        onSetLinkChannel(widget.id, isActive ? null : ch)
                        setPickerOpen(false)
                      }}
                      className="cursor-pointer transition-opacity hover:opacity-100"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: LINK_CHANNEL_COLORS[ch],
                        opacity: isActive ? 1 : 0.4,
                        boxShadow: isActive
                          ? `0 0 0 1.5px #1a1a1a, 0 0 0 2.5px ${LINK_CHANNEL_COLORS[ch]}`
                          : 'none',
                      }}
                      title={`Channel ${ch}`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          onMouseDown={(e) => e.stopPropagation()}
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
