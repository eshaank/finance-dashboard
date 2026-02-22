import { useState } from 'react'
import { BulkInsideDayScanner } from './BulkInsideDayScanner'
import { InsideDayScanner } from './InsideDayScanner'

type SubTab = 'bulk' | 'single'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'bulk', label: 'Inside Days Scanner' },
  { id: 'single', label: 'Single Ticker' },
]

export function ScannerTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('bulk')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-lg font-semibold text-dash-text">Scanner</h1>
        <div className="mt-4 flex gap-1 border-b border-white/5">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                relative px-3 py-2 text-sm font-medium transition-colors
                ${activeSubTab === tab.id
                  ? 'text-dash-text'
                  : 'text-white/40 hover:text-white/60'}
              `}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'bulk' && <BulkInsideDayScanner />}
      {activeSubTab === 'single' && <InsideDayScanner />}
    </div>
  )
}
