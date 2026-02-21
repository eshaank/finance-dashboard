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
    <nav className="flex gap-0 border-b border-white/[0.06]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            'px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors relative',
            active === t.id
              ? 'text-white'
              : 'text-white/40 hover:text-white/60',
          )}
        >
          {t.label}
          {active === t.id ? (
            <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-accent rounded-full" />
          ) : null}
        </button>
      ))}
    </nav>
  )
}
