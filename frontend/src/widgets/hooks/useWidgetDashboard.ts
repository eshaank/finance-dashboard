import { useState, useEffect, useCallback, useRef } from 'react'
import type { WidgetTypeId, DashboardState } from '../types'
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

  const addWidget = useCallback((type: WidgetTypeId) => {
    const def = getWidgetDefinition(type)
    if (!def) return

    setState((prev) => {
      const offset = prev.widgets.length * 20
      const instance = {
        id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
        type,
        config: { ...def.defaultConfig },
        layout: {
          x: 20 + offset,
          y: 20 + offset,
          w: def.defaultLayout.w,
          h: def.defaultLayout.h,
        },
      }
      return { ...prev, widgets: [...prev.widgets, instance] }
    })
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

  const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, layout: { ...w.layout, x, y } } : w,
      ),
    }))
  }, [])

  const resetToDefault = useCallback(() => {
    localStorage.removeItem('finance-dashboard-widgets')
    setState(storage.load())
  }, [])

  return {
    widgets: state.widgets,
    isEditing,
    setIsEditing,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateWidgetPosition,
    resetToDefault,
  }
}
