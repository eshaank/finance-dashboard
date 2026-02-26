import { useState, useEffect, useCallback, useRef } from 'react'
import type { WidgetTypeId, DashboardState, LinkChannel } from '../types'
import { getWidgetDefinition } from '../registry'
import { createLocalStorage } from '../storage'

const storage = createLocalStorage()

export function useWidgetDashboard() {
  const [state, setState] = useState<DashboardState>(() => storage.load())
  const [isEditing, setIsEditing] = useState(false)
  const focusedWidgetIdRef = useRef<string | null>(null)
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
        linkChannel: null as LinkChannel,
      }
      return { ...prev, widgets: [...prev.widgets, instance] }
    })
  }, [])

  const removeWidget = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== id),
    }))
    if (focusedWidgetIdRef.current === id) {
      focusedWidgetIdRef.current = null
    }
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

  const broadcastTicker = useCallback((sourceWidgetId: string, ticker: string) => {
    setState((prev) => {
      const source = prev.widgets.find((w) => w.id === sourceWidgetId)
      if (!source) return prev

      if (source.linkChannel === null) {
        // Unlinked: only update the source widget
        return {
          ...prev,
          widgets: prev.widgets.map((w) =>
            w.id === sourceWidgetId
              ? { ...w, config: { ...w.config, ticker } }
              : w,
          ),
        }
      }

      // Linked: update all widgets in the same channel
      const channel = source.linkChannel
      return {
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.linkChannel === channel
            ? { ...w, config: { ...w.config, ticker } }
            : w,
        ),
      }
    })
  }, [])

  const setTickerForFocused = useCallback((ticker: string) => {
    const id = focusedWidgetIdRef.current
    if (id) {
      broadcastTicker(id, ticker)
      return
    }
    // Nothing focused — target first price-chart, or first widget
    setState((prev) => {
      const target =
        prev.widgets.find((w) => w.type === 'price-chart') ?? prev.widgets[0]
      if (!target) return prev
      if (target.linkChannel === null) {
        return {
          ...prev,
          widgets: prev.widgets.map((w) =>
            w.id === target.id
              ? { ...w, config: { ...w.config, ticker } }
              : w,
          ),
        }
      }
      const ch = target.linkChannel
      return {
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.linkChannel === ch
            ? { ...w, config: { ...w.config, ticker } }
            : w,
        ),
      }
    })
  }, [broadcastTicker])

  const setLinkChannel = useCallback((id: string, channel: LinkChannel) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, linkChannel: channel } : w,
      ),
    }))
  }, [])

  const resetToDefault = useCallback(() => {
    localStorage.removeItem('finance-dashboard-widgets')
    setState(storage.load())
  }, [])

  const setFocusedWidgetId = useCallback((id: string | null) => {
    focusedWidgetIdRef.current = id
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
    focusedWidgetId: focusedWidgetIdRef.current,
    setFocusedWidgetId,
    broadcastTicker,
    setTickerForFocused,
    setLinkChannel,
  }
}
