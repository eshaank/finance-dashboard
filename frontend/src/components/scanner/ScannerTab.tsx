import { useState, useCallback } from 'react'
import { BulkInsideDayScanner } from './BulkInsideDayScanner'
import { InsideDayScanner } from './InsideDayScanner'
import { ScannerDetailPanel } from './ScannerDetailPanel'
import type { BulkInsideDayItem } from '../../types'

type SubTab = 'bulk' | 'single'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'bulk', label: 'Bulk Scanner' },
  { id: 'single', label: 'Single Ticker' },
]

export function ScannerTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('bulk')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<BulkInsideDayItem | null>(null)

  const handleTickerSelect = useCallback((ticker: string | null, item?: BulkInsideDayItem) => {
    setSelectedTicker(ticker)
    setSelectedItem(item ?? null)
  }, [])

  const handleTabChange = useCallback((tab: SubTab) => {
    setActiveSubTab(tab)
    setSelectedTicker(null)
    setSelectedItem(null)
  }, [])

  const handleDetailClose = useCallback(() => {
    setSelectedTicker(null)
    setSelectedItem(null)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-lg font-semibold text-dash-text tracking-tight">
          Scanner
        </h1>
        <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                ${activeSubTab === tab.id
                  ? 'bg-accent text-white shadow-sm shadow-accent/15'
                  : 'text-dash-muted/50 hover:text-dash-muted hover:bg-white/[0.03]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="min-w-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto scrollbar-hide">
            <BulkInsideDayScanner
              selectedTicker={selectedTicker}
              onTickerSelect={handleTickerSelect}
            />
          </div>
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-120px)] min-w-0">
            <ScannerDetailPanel
              ticker={selectedTicker}
              selectedItem={selectedItem}
              onClose={handleDetailClose}
            />
          </div>
        </div>
      )}

      {activeSubTab === 'single' && <InsideDayScanner />}
    </div>
  )
}
