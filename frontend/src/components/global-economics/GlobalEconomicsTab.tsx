import { useState, useRef } from 'react'
import { MapMetricTabs, INDICATORS } from './MapMetricTabs'
import { WorldChoropleth } from './WorldChoropleth'
import { CountryDetailPanel } from './CountryDetailPanel'
import { useWorldBankData } from '../../hooks/useWorldBankData'
import type { IndicatorId, CountryRecord, AllIndicatorsData } from '../../types'

export function GlobalEconomicsTab() {
  const [activeIndicator, setActiveIndicator] = useState<IndicatorId>('gdp')
  const [hoveredCountry, setHoveredCountry] = useState<CountryRecord | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(null)

  const allDataRef = useRef<AllIndicatorsData>({})

  const { data, loading } = useWorldBankData(activeIndicator)

  if (data) {
    allDataRef.current[activeIndicator] = data
  }

  const indicatorConfig = INDICATORS.find((i) => i.id === activeIndicator)!
  const displayedCountry = hoveredCountry ?? selectedCountry

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6 md:flex-row min-h-[300px] md:min-h-[520px]">
      {/* Left: map */}
      <div className="min-w-0 md:flex-[0_0_55%]">
        <div className="glass-card h-full rounded-xl overflow-hidden flex flex-col">
          <div className="border-b border-white/5 px-3 py-3 sm:px-5 sm:py-4 shrink-0">
            <h2 className="font-display text-base font-semibold text-dash-text">
              Economic Map
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Global macro view · World Bank data
            </p>
          </div>

          <MapMetricTabs active={activeIndicator} onChange={setActiveIndicator} />

          <div className="relative flex-1 min-h-[420px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              </div>
            )}
            <WorldChoropleth
              data={data}
              indicator={indicatorConfig}
              onHover={setHoveredCountry}
              onSelect={setSelectedCountry}
            />
          </div>
        </div>
      </div>

      {/* Right: country detail */}
      <div className="min-w-0 md:flex-[0_0_45%]">
        <div className="glass-card h-full rounded-xl overflow-hidden">
          <div className="border-b border-white/5 px-3 py-3 sm:px-5 sm:py-4">
            <h2 className="font-display text-base font-semibold text-dash-text">
              Country Profile
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {displayedCountry ? displayedCountry.name : 'Select a country on the map'}
            </p>
          </div>
          <CountryDetailPanel
            country={displayedCountry}
            allData={allDataRef.current}
          />
        </div>
      </div>
    </div>
  )
}
