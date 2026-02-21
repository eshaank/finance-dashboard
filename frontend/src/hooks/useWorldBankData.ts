import { useState, useRef, useEffect } from 'react'
import type { IndicatorId, IndicatorData, AllIndicatorsData } from '../types'

const INDICATOR_FILES: Record<IndicatorId, string> = {
  gdp: '/data/wb-gdp.json',
  unemployment: '/data/wb-unemployment.json',
  govtDebt: '/data/wb-govt-debt.json',
  interestRate: '/data/wb-interest-rate.json',
  inflation: '/data/wb-inflation.json',
}

// World Bank aggregate/region codes to skip (not real countries)
const AGGREGATE_IDS = new Set([
  '1A','S3','B8','V2','Z4','4E','T4','XC','Z7','7E','T7','EU','F1','XE',
  'XD','XF','XH','XI','XG','XJ','T2','XL','XO','XM','XN','XT','OE',
  'XP','XQ','ZQ','XU','ZJ','ZG','ZF','ZE','ZD','ZS','UZ','V3','V1',
  '8S','S1','S2','T3','T5','T6','T7','U6','U5','U4','U3','U2','U1',
  'WLD','EAS','EAP','EMU','ECA','ECS','LAC','LCN','MNA','MEA','NAC',
  'SAR','SAS','SSA','SSF','INX','HIC','LMC','LMY','LIC','MIC','MNA',
  'OED','PRE','PSS','PST','TSA','TSS','UMC','CSS','PHL',
])

interface WBRawEntry {
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
}

function transformRaw(raw: [unknown, WBRawEntry[]]): IndicatorData {
  const entries = raw[1] ?? []
  const byIso3: Record<string, WBRawEntry[]> = {}

  for (const entry of entries) {
    const iso3 = entry.countryiso3code
    const id = entry.country.id
    if (!iso3 || AGGREGATE_IDS.has(iso3) || AGGREGATE_IDS.has(id)) continue
    if (!byIso3[iso3]) byIso3[iso3] = []
    byIso3[iso3].push(entry)
  }

  const result: IndicatorData = {}
  for (const [iso3, rows] of Object.entries(byIso3)) {
    const yearly: Record<string, number | null> = {}
    let latestValue: number | null = null
    let latestYear = ''

    // Sort descending by year to find most recent non-null
    const sorted = [...rows].sort((a, b) => Number(b.date) - Number(a.date))
    for (const row of sorted) {
      yearly[row.date] = row.value
      if (latestValue === null && row.value !== null) {
        latestValue = row.value
        latestYear = row.date
      }
    }

    result[iso3] = {
      iso3,
      iso2: rows[0].country.id,
      name: rows[0].country.value,
      value: latestValue,
      year: latestYear,
      yearly,
    }
  }
  return result
}

interface WorldBankDataState {
  data: IndicatorData | null
  loading: boolean
  error: string | null
}

export function useWorldBankData(indicatorId: IndicatorId) {
  const cache = useRef<AllIndicatorsData>({})
  const [state, setState] = useState<WorldBankDataState>({
    data: cache.current[indicatorId] ?? null,
    loading: !cache.current[indicatorId],
    error: null,
  })

  useEffect(() => {
    if (cache.current[indicatorId]) {
      setState({ data: cache.current[indicatorId]!, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetch(INDICATOR_FILES[indicatorId])
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<[unknown, WBRawEntry[]]>
      })
      .then(raw => {
        if (cancelled) return
        const data = transformRaw(raw)
        cache.current[indicatorId] = data
        setState({ data, loading: false, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ data: null, loading: false, error: String(err) })
      })

    return () => { cancelled = true }
  }, [indicatorId])

  return state
}
