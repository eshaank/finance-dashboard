import { cn } from '../../lib/utils'

interface Tab {
  id: string
  label: string
}

interface SubTabNavProps {
  tabs: Tab[]
  active: string
  onSelect: (id: string) => void
}

export function SubTabNav({ tabs, active, onSelect }: SubTabNavProps) {
  return (
    <nav
      className="flex gap-0 border-b border-white/[0.06]"
      role="tablist"
      aria-label="Sub-tab navigation"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          role="tab"
          aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={active === t.id ? 0 : -1}
          className={cn(
            'px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 relative',
            'min-h-[44px] flex items-center',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-inset',
            active === t.id
              ? 'text-white'
              : 'text-white/40 hover:text-white/60',
          )}
        >
          {t.label}
          {active === t.id ? (
            <span
              className="absolute bottom-0 left-1 right-1 h-[2px] bg-accent rounded-full"
              aria-hidden="true"
            />
          ) : null}
        </button>
      ))}
    </nav>
  )
}
