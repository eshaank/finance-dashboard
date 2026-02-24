import { useMemo } from 'react'
import { ResponsiveGridLayout, verticalCompactor, useContainerWidth } from 'react-grid-layout'
import type { LayoutItem, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { WidgetShell } from './WidgetShell'
import type { WidgetInstance } from '../types'

interface WidgetGridProps {
  widgets: WidgetInstance[]
  layouts: LayoutItem[]
  isEditing: boolean
  onLayoutChange: (layouts: LayoutItem[]) => void
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: Record<string, unknown>) => void
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
const DRAG_CONFIG = { enabled: true, handle: '.widget-drag-handle', bounded: false, threshold: 3 }

export function WidgetGrid({
  widgets,
  layouts,
  isEditing,
  onLayoutChange,
  onRemove,
  onConfigChange,
}: WidgetGridProps) {
  const { containerRef, width, mounted } = useContainerWidth({ measureBeforeMount: true })

  const allLayouts = useMemo(() => ({
    lg: layouts,
    md: layouts,
    sm: layouts,
    xs: layouts,
    xxs: layouts,
  }), [layouts])

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          layouts={allLayouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={32}
          margin={[8, 8]}
          containerPadding={[0, 0]}
          dragConfig={DRAG_CONFIG}
          compactor={verticalCompactor}
          onLayoutChange={(layout: Layout) => onLayoutChange([...layout])}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <WidgetShell
                widget={widget}
                isEditing={isEditing}
                onRemove={onRemove}
                onConfigChange={onConfigChange}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
