import type { DashboardState, WidgetInstance } from './types'

const STORAGE_KEY = 'finance-dashboard-widgets'
const CURRENT_VERSION = 6

export interface WidgetStorage {
  load(): DashboardState
  save(state: DashboardState): void
}

function defaultState(): DashboardState {
  const defaults: WidgetInstance[] = [
    {
      id: 'default-quote-monitor',
      type: 'quote-monitor',
      config: {},
      layout: { x: 0, y: 0, w: 480, h: 200 },
    },
    {
      id: 'default-price-chart',
      type: 'price-chart',
      config: { ticker: 'AAPL', timeframe: '6M' },
      layout: { x: 482, y: 0, w: 420, h: 200 },
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
