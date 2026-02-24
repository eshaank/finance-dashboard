import type { ComponentType } from 'react'

export type WidgetTypeId =
  | 'market-indices'
  | 'price-chart'
  | 'upcoming-events'
  | 'economic-calendar'
  | 'company-info'

export interface WidgetLayout {
  x: number
  y: number
  w: number
  h: number
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
    w: number
    h: number
    minW: number
    minH: number
    maxW?: number
    maxH?: number
  }
  component: ComponentType<WidgetProps>
}

export interface DashboardState {
  widgets: WidgetInstance[]
  version: number
}
