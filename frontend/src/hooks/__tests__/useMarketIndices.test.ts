import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { useMarketIndices } from '../useMarketIndices'
import type { MarketIndex } from '../../types'

// Mock the supabase module so apiFetcher doesn't throw on missing env vars
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  },
}))

const sampleIndices: MarketIndex[] = [
  {
    id: '1',
    ticker: 'SPY',
    name: 'S&P 500',
    price: 5200.5,
    change: 32.1,
    changePercent: 0.62,
    exchange: 'NYSE',
    trend: 'up',
  },
  {
    id: '2',
    ticker: 'QQQ',
    name: 'Nasdaq 100',
    price: 18100.75,
    change: -45.3,
    changePercent: -0.25,
    exchange: 'NASDAQ',
    trend: 'down',
  },
]

// Wrapper that gives each test a fresh SWR cache
function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useMarketIndices', () => {
  it('returns market index data from the API', async () => {
    const envelope = {
      data: sampleIndices,
      meta: { timestamp: '2026-01-01T00:00:00Z', request_id: 'test' },
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(envelope),
    } as Response)

    const { result } = renderHook(() => useMarketIndices(), { wrapper })

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(sampleIndices)
    expect(result.current.error).toBeNull()
  })

  it('returns empty array and error message on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    const { result } = renderHook(() => useMarketIndices(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe('API error 500: Internal Server Error')
  })
})
