import { useState, useEffect, useCallback, useRef } from 'react'
import type { LayoutItem } from 'react-grid-layout'
import type { WidgetTypeId, WidgetInstance, DashboardState } from '../types'
import { getWidgetDefinition } from '../registry'
import { createLocalStorage } from '../storage'

const storage = createLocalStorage()

export function useWidgetDashboard() {
  const [state, setState] = useState<DashboardState>(() => storage.load())
  const [isEditing, setIsEditing] = useState(false)
  const initialLoad = useRef(true)

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      return
    }
    storage.save(state)
  }, [state])

  const gridLayouts: LayoutItem[] = state.widgets.map((w) => {
    const def = getWidgetDefinition(w.type)
    return {
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: def?.defaultLayout.minW,
      minH: def?.defaultLayout.minH,
      maxW: def?.defaultLayout.maxW,
      maxH: def?.defaultLayout.maxH,
    }
  })

  const addWidget = useCallback((type: WidgetTypeId) => {
    const def = getWidgetDefinition(type)
    if (!def) return

    const instance: WidgetInstance = {
      id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
      type,
      config: { ...def.defaultConfig },
      layout: {
        x: 0,
        y: Infinity,
        w: def.defaultLayout.w,
        h: def.defaultLayout.h,
      },
    }

    setState((prev) => ({
      ...prev,
      widgets: [...prev.widgets, instance],
    }))
  }, [])

  const removeWidget = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== id),
    }))
  }, [])

  const updateWidgetConfig = useCallback((id: string, config: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, config: { ...w.config, ...config } } : w,
      ),
    }))
  }, [])

  const handleLayoutChange = useCallback((layouts: LayoutItem[]) => {
    setState((prev) => {
      const layoutMap = new Map(layouts.map((l) => [l.i, l]))
      const updated = prev.widgets.map((w) => {
        const l = layoutMap.get(w.id)
        if (!l) return w
        return {
          ...w,
          layout: { x: l.x, y: l.y, w: l.w, h: l.h },
        }
      })
      return { ...prev, widgets: updated }
    })
  }, [])

  const resetToDefault = useCallback(() => {
    localStorage.removeItem('finance-dashboard-widgets')
    setState(storage.load())
  }, [])

  return {
    widgets: state.widgets,
    gridLayouts,
    isEditing,
    setIsEditing,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    handleLayoutChange,
    resetToDefault,
  }
}
