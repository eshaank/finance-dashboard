import { Search } from 'lucide-react'

const CATEGORIES = [
  { key: 'All', color: 'bg-accent text-white' },
  { key: 'Politics', color: 'bg-dash-red text-white' },
  { key: 'Crypto', color: 'bg-[#f97316] text-white' },
  { key: 'Sports', color: 'bg-dash-green text-white' },
  { key: 'Culture', color: 'bg-[#a855f7] text-white' },
  { key: 'Science', color: 'bg-[#3b82f6] text-white' },
] as const

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(({ key, color }) => {
          const isActive = activeCategory.toLowerCase() === key.toLowerCase()
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={[
                'px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer',
                isActive
                  ? color
                  : 'bg-white/[0.05] text-white/50 hover:text-white/80 hover:bg-white/[0.08]',
              ].join(' ')}
            >
              {key}
            </button>
          )
        })}
      </div>
      <div className="relative shrink-0">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
        <input
          type="text"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-44 pl-7 pr-2 py-1.5 rounded-md bg-white/[0.05] border border-white/[0.06]
                     text-[10px] text-dash-text placeholder:text-white/25
                     focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
        />
      </div>
    </div>
  )
}
