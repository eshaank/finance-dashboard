import type { WidgetTypeId, WidgetDefinition, WidgetCategory } from './types'

const registry = new Map<WidgetTypeId, WidgetDefinition>()

export function registerWidget(definition: WidgetDefinition): void {
  registry.set(definition.type, definition)
}

export function getWidgetDefinition(type: WidgetTypeId): WidgetDefinition | undefined {
  return registry.get(type)
}

export function getAllWidgetDefinitions(): WidgetDefinition[] {
  return Array.from(registry.values())
}

export function getWidgetsByCategory(): Record<WidgetCategory, WidgetDefinition[]> {
  const groups: Record<WidgetCategory, WidgetDefinition[]> = {
    market: [],
    economics: [],
    research: [],
  }
  for (const def of registry.values()) {
    groups[def.category].push(def)
  }
  return groups
}
