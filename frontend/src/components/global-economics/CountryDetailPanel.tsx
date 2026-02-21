import { Globe } from 'lucide-react'
import type { CountryRecord, AllIndicatorsData } from '../../types'
import { INDICATORS } from './MapMetricTabs'
import { MiniSparkline } from './MiniSparkline'

interface CountryDetailPanelProps {
  country: CountryRecord | null
  allData: AllIndicatorsData
}

export function CountryDetailPanel({ country, allData }: CountryDetailPanelProps) {
  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20 py-16">
        <Globe size={40} strokeWidth={1} />
        <p className="text-sm">Hover or click a country</p>
      </div>
    )
  }

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="font-display text-lg font-semibold text-dash-text">{country.name}</h3>
        <p className="text-xs text-white/40 mt-0.5">{country.iso3} · {country.iso2}</p>
      </div>

      {/* Indicator rows */}
      <div className="flex flex-col gap-3">
        {INDICATORS.map((ind) => {
          const indData = allData[ind.id]
          const rec = indData?.[country.iso3]
          const value = rec?.value ?? null
          const yearly = rec?.yearly ?? {}

          return (
            <div
              key={ind.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-white/3 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/40 truncate">{ind.label}</p>
                <p className="text-sm font-semibold text-dash-text mt-0.5">
                  {value !== null ? ind.format(value) : '—'}
                </p>
                {rec?.year && (
                  <p className="text-[10px] text-white/25 mt-0.5">{rec.year}</p>
                )}
              </div>
              <MiniSparkline yearly={yearly} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
