import { useCallback, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import type { DraggableEvent, DraggableData } from 'react-draggable'
import { TerminalPanel } from './TerminalPanel'
import type { WidgetInstance, LinkChannel } from '../types'

interface TerminalWorkspaceProps {
  widgets: WidgetInstance[]
  isEditing: boolean
  onPositionChange: (id: string, x: number, y: number) => void
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
  onFocusChange: (id: string) => void
  onBroadcastTicker: (sourceWidgetId: string, ticker: string) => void
  onSetLinkChannel: (id: string, channel: LinkChannel) => void
}

export function TerminalWorkspace({
  widgets,
  isEditing,
  onPositionChange,
  onRemove,
  onConfigChange,
  onFocusChange,
  onBroadcastTicker,
  onSetLinkChannel,
}: TerminalWorkspaceProps) {
  const [, setZCounter] = useState(10)
  const [zMap, setZMap] = useState<Record<string, number>>({})
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const nodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-bring new widgets to front
  const knownIds = useRef(new Set(widgets.map((w) => w.id)))
  useEffect(() => {
    const currentIds = new Set(widgets.map((w) => w.id))
    for (const id of currentIds) {
      if (!knownIds.current.has(id)) {
        setZCounter((prev) => {
          const next = prev + 1
          setZMap((m) => ({ ...m, [id]: next }))
          return next
        })
        setFocusedId(id)
        onFocusChange(id)
      }
    }
    knownIds.current = currentIds
  }, [widgets, onFocusChange])

  const bringToFront = useCallback((id: string) => {
    setZCounter((prev) => {
      const next = prev + 1
      setZMap((m) => ({ ...m, [id]: next }))
      return next
    })
    setFocusedId(id)
    onFocusChange(id)
  }, [onFocusChange])

  const handleDragStop = useCallback(
    (_e: DraggableEvent, data: DraggableData, id: string) => {
      onPositionChange(id, data.x, data.y)
    },
    [onPositionChange],
  )

  function getNodeRef(id: string) {
    if (!nodeRefs.current[id]) {
      nodeRefs.current[id] = { current: null } as React.RefObject<HTMLDivElement | null>
    }
    return nodeRefs.current[id]
  }

  return (
    <div ref={containerRef} className="terminal-workspace relative w-full">
      {widgets.map((widget) => {
        const ref = getNodeRef(widget.id)
        return (
          <Draggable
            key={widget.id}
            nodeRef={ref}
            handle=".drag-handle"
            position={{ x: widget.layout.x, y: widget.layout.y }}
            onStop={(e, data) => handleDragStop(e, data, widget.id)}
            onStart={() => bringToFront(widget.id)}
            bounds="parent"
          >
            <div
              ref={ref}
              className="group widget-resizable"
              style={{
                position: 'absolute',
                width: widget.layout.w,
                minHeight: widget.layout.h,
                zIndex: zMap[widget.id] ?? widget.layout.zIndex ?? 1,
              }}
            >
              <TerminalPanel
                widget={widget}
                isEditing={isEditing}
                isFocused={focusedId === widget.id}
                onRemove={onRemove}
                onConfigChange={onConfigChange}
                onFocus={bringToFront}
                onBroadcastTicker={onBroadcastTicker}
                onSetLinkChannel={onSetLinkChannel}
              />
            </div>
          </Draggable>
        )
      })}
    </div>
  )
}
