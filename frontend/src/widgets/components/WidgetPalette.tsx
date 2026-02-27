import { BarChart3, LineChart, CalendarClock, Calendar, Building2, X, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getWidgetsByCategory } from '../registry'
import type { WidgetTypeId, WidgetCategory } from '../types'

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  LineChart,
  CalendarClock,
  Calendar,
  Building2,
}

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  market: 'Market Data',
  economics: 'Economics',
  research: 'Research',
}

interface WidgetPaletteProps {
  open: boolean
  onClose: () => void
  onAddWidget: (type: WidgetTypeId) => void
}

export function WidgetPalette({ open, onClose, onAddWidget }: WidgetPaletteProps) {
  if (!open) return null

  const grouped = getWidgetsByCategory()

  function handleAdd(type: WidgetTypeId) {
    onAddWidget(type)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-dash-surface border-l border-white/10 z-50 animate-slide-fade flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <h2 className="font-display text-sm font-semibold text-dash-text">Add Widget</h2>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {(Object.keys(CATEGORY_LABELS) as WidgetCategory[]).map((cat) => {
            const defs = grouped[cat]
            if (defs.length === 0) return null

            return (
              <div key={cat}>
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <div className="space-y-2">
                  {defs.map((def) => {
                    const Icon = ICON_MAP[def.icon] ?? BarChart3
                    return (
                      <button
                        key={def.type}
                        onClick={() => handleAdd(def.type)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group/item text-left"
                      >
                        <div className="shrink-0 w-9 h-9 bg-accent/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dash-text">{def.name}</p>
                          <p className="text-xs text-white/40 truncate">{def.description}</p>
                        </div>
                        <Plus className="w-4 h-4 text-white/20 group-hover/item:text-white/50 transition-colors shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
