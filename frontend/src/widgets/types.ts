import type { ComponentType } from 'react'

export type WidgetTypeId =
  | 'quote-monitor'
  | 'price-chart'

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
}

export interface WidgetProps {
  id: string
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
  onRemove: () => void
  isEditing: boolean
  linkedTicker?: string
  onLinkedTickerChange?: (ticker: string) => void
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
