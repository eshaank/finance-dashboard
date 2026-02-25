import { useState, useCallback, useRef } from 'react'
import Draggable from 'react-draggable'
import type { DraggableEvent, DraggableData } from 'react-draggable'
import { TerminalPanel } from './TerminalPanel'
import type { WidgetInstance } from '../types'

interface TerminalWorkspaceProps {
  widgets: WidgetInstance[]
  isEditing: boolean
  onPositionChange: (id: string, x: number, y: number) => void
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
  linkedTicker: string
  onLinkedTickerChange: (ticker: string) => void
}

export function TerminalWorkspace({
  widgets,
  isEditing,
  onPositionChange,
  onRemove,
  onConfigChange,
  linkedTicker,
  onLinkedTickerChange,
}: TerminalWorkspaceProps) {
  const [zCounter, setZCounter] = useState(10)
  const [zMap, setZMap] = useState<Record<string, number>>({})
  const nodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({})
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const bringToFront = useCallback((id: string) => {
    setZCounter((prev) => {
      const next = prev + 1
      setZMap((m) => ({ ...m, [id]: next }))
      return next
    })
    setFocusedId(id)
  }, [])

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
                linkedTicker={linkedTicker}
                onLinkedTickerChange={onLinkedTickerChange}
              />
            </div>
          </Draggable>
        )
      })}
    </div>
  )
}
