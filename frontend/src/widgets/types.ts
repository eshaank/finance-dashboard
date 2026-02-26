import type { ComponentType } from 'react'

export type WidgetTypeId =
  | 'quote-monitor'
  | 'price-chart'

export type LinkChannel = null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const LINK_CHANNEL_COLORS: Record<number, string> = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#06b6d4', // cyan
  6: '#3b82f6', // blue
  7: '#a855f7', // purple
  8: '#ec4899', // pink
}

export interface WidgetLayout {
  x: number       // px from left
  y: number       // px from top
  w: number       // width in px
  h: number       // height in px
  zIndex?: number  // stacking order
}

export interface WidgetInstance {
  id: string
  type: WidgetTypeId
  config: Record<string, unknown>
  layout: WidgetLayout
  linkChannel: LinkChannel
}

export interface WidgetProps {
  id: string
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
  onRemove: () => void
  isEditing: boolean
  isFocused: boolean
  linkChannel: LinkChannel
  onTickerChange?: (ticker: string) => void
}

export type WidgetCategory = 'market' | 'economics' | 'research'

export interface WidgetDefinition {
  type: WidgetTypeId
  name: string
  description: string
  icon: string
  category: WidgetCategory
  defaultConfig: Record<string, unknown>
  defaultLayout: {
    w: number  // default width px
    h: number  // default height px
  }
  component: ComponentType<WidgetProps>
}

export interface DashboardState {
  widgets: WidgetInstance[]
  version: number
}
