import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Pencil, Check, RotateCcw, LayoutGrid } from 'lucide-react'
import { useWidgetDashboard, WidgetGrid, WidgetPalette } from '../../widgets'

function DashboardControls({
  isEditing,
  setIsEditing,
  onAdd,
  onReset,
}: {
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  onAdd: () => void
  onReset: () => void
}) {
  return (
    <>
      {isEditing && (
        <button
          onClick={onReset}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
          title="Reset layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={onAdd}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
        title="Add Widget"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
          isEditing
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'bg-white/5 text-white/60 hover:bg-white/10'
        }`}
        title={isEditing ? 'Done editing' : 'Edit layout'}
      >
        {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
      </button>
    </>
  )
}

export function DashboardHome() {
  const {
    widgets,
    gridLayouts,
    isEditing,
    setIsEditing,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    handleLayoutChange,
    resetToDefault,
  } = useWidgetDashboard()

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.getElementById('dashboard-controls')
    setPortalTarget(el)
  }, [])

  const isEmpty = widgets.length === 0

  return (
    <main className="p-3 animate-fade-in min-h-[calc(100vh-60px)]">
      {/* Portal controls into Header */}
      {portalTarget &&
        createPortal(
          <DashboardControls
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onAdd={() => setPaletteOpen(true)}
            onReset={resetToDefault}
          />,
          portalTarget,
        )}

      {/* Widget Grid or Empty State */}
      {isEmpty ? (
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-dash-surface/60 p-10 text-center mt-12">
          <LayoutGrid className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <h3 className="font-display text-base font-semibold text-dash-text mb-2">
            No widgets yet
          </h3>
          <p className="text-sm text-white/40 mb-6">
            Add widgets to customize your dashboard with market data, charts, economic calendars, and more.
          </p>
          <button
            onClick={() => setPaletteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Widget
          </button>
        </div>
      ) : (
        <WidgetGrid
          widgets={widgets}
          layouts={gridLayouts}
          isEditing={isEditing}
          onLayoutChange={handleLayoutChange}
          onRemove={removeWidget}
          onConfigChange={updateWidgetConfig}
        />
      )}

      {/* Widget Palette */}
      <WidgetPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAddWidget={addWidget}
      />
    </main>
  )
}
