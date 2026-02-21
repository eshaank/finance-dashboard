import { useState, useCallback } from 'react'
import type { MouseEvent } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import type { RSMGeo } from 'react-simple-maps'
import { scaleSequential, scaleSequentialLog } from 'd3-scale'
import { extent } from 'd3-array'
import { isoNumericToIso3 } from '../../lib/iso-numeric-to-iso3'
import { MapLegend } from './MapLegend'
import type { IndicatorData, CountryRecord } from '../../types'
import type { IndicatorConfig } from './MapMetricTabs'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const NO_DATA_COLOR = '#1e1e28'
const OCEAN_COLOR   = '#0d0d14'

interface TooltipState {
  x: number
  y: number
  name: string
  value: string
}

interface WorldChoroplethProps {
  data: IndicatorData | null
  indicator: IndicatorConfig
  onHover: (country: CountryRecord | null) => void
  onSelect: (country: CountryRecord | null) => void
}

function interpolateOrangeGradient(t: number): string {
  // near-black → orange
  const r = Math.round(26  + t * (249 - 26))
  const g = Math.round(26  + t * (115 - 26))
  const b = Math.round(34  + t * (22  - 34))
  return `rgb(${r},${g},${b})`
}

function buildColorScale(data: IndicatorData | null, indicatorId: string) {
  if (!data) return (_v: number | null) => NO_DATA_COLOR

  const values = Object.values(data)
    .map((c) => c.value)
    .filter((v): v is number => v !== null)

  const [minV, maxV] = extent(values) as [number | undefined, number | undefined]
  if (minV === undefined || maxV === undefined) return (_v: number | null) => NO_DATA_COLOR

  if (indicatorId === 'gdp') {
    const scale = scaleSequentialLog([Math.max(minV, 1), maxV], interpolateOrangeGradient)
    return (v: number | null) => (v === null ? NO_DATA_COLOR : scale(v))
  }

  const scale = scaleSequential([minV, maxV], interpolateOrangeGradient)
  return (v: number | null) => (v === null ? NO_DATA_COLOR : scale(v))
}

export function WorldChoropleth({ data, indicator, onHover, onSelect }: WorldChoroplethProps) {
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const colorScale = buildColorScale(data, indicator.id)

  const values = data
    ? Object.values(data).map((c) => c.value).filter((v): v is number => v !== null)
    : []
  const [minV, maxV] = extent(values) as [number | undefined, number | undefined]
  const minLabel = minV !== undefined ? indicator.format(minV) : ''
  const maxLabel = maxV !== undefined ? indicator.format(maxV) : ''

  const getRecord = useCallback(
    (geo: RSMGeo): CountryRecord | null => {
      const iso3 = isoNumericToIso3[geo.id]
      return iso3 && data ? (data[iso3] ?? null) : null
    },
    [data],
  )

  const handleMouseEnter = useCallback(
    (geo: RSMGeo, evt: MouseEvent<SVGPathElement>) => {
      const record = getRecord(geo)
      onHover(record)
      const valueStr = record?.value != null ? indicator.format(record.value) : '—'
      const name = record?.name ?? String(geo.properties['name'] ?? geo.id)
      setTooltip({ x: evt.clientX, y: evt.clientY, name, value: valueStr })
    },
    [getRecord, indicator, onHover],
  )

  const handleMouseMove = useCallback((evt: MouseEvent<HTMLDivElement>) => {
    setTooltip((t) => t ? { ...t, x: evt.clientX, y: evt.clientY } : null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    onHover(null)
    setTooltip(null)
  }, [onHover])

  const handleClick = useCallback(
    (geo: RSMGeo) => {
      onSelect(getRecord(geo))
    },
    [getRecord, onSelect],
  )

  return (
    <div className="relative w-full h-full select-none" onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [0, 20] }}
        style={{ width: '100%', height: '100%', background: OCEAN_COLOR }}
      >
        <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const record = getRecord(geo)
                const fill = colorScale(record?.value ?? null)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#0d0d14"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: 'none' },
                      hover:   { fill: '#fb923c', outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#ea580c', outline: 'none' },
                    }}
                    onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(geo)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        {(
          [
            { label: '+', action: () => setZoom((z) => Math.min(z + 0.8, 8)) },
            { label: '↺', action: () => setZoom(1) },
            { label: '−', action: () => setZoom((z) => Math.max(z - 0.8, 1)) },
          ] as { label: string; action: () => void }[]
        ).map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm flex items-center justify-center transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      {minLabel && <MapLegend minLabel={minLabel} maxLabel={maxLabel} />}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none glass-card rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <span className="text-white/80 font-medium">{tooltip.name}</span>
          <span className="ml-2 text-orange-400 font-semibold">{tooltip.value}</span>
        </div>
      )}
    </div>
  )
}
