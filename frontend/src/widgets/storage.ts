import type { DashboardState, WidgetInstance } from './types'

const STORAGE_KEY = 'finance-dashboard-widgets'
const CURRENT_VERSION = 2

export interface WidgetStorage {
  load(): DashboardState
  save(state: DashboardState): void
}

function defaultState(): DashboardState {
  const defaults: WidgetInstance[] = [
    {
      id: 'default-market-indices',
      type: 'market-indices',
      config: {},
      layout: { x: 0, y: 0, w: 12, h: 5 },
    },
    {
      id: 'default-upcoming-events',
      type: 'upcoming-events',
      config: {},
      layout: { x: 0, y: 5, w: 6, h: 8 },
    },
  ]
  return { widgets: defaults, version: CURRENT_VERSION }
}

export function createLocalStorage(): WidgetStorage {
  return {
    load(): DashboardState {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return defaultState()

        const parsed = JSON.parse(raw) as DashboardState
        if (parsed.version !== CURRENT_VERSION) return defaultState()

        return parsed
      } catch {
        return defaultState()
      }
    },

    save(state: DashboardState): void {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.error('Failed to save widget layout:', err)
      }
    },
  }
}
