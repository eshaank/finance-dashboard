import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetcher } from '../swr'

// Mock the supabase module so it doesn't throw on missing env vars
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '../supabase'

const mockGetSession = vi.mocked(supabase.auth.getSession)

beforeEach(() => {
  vi.restoreAllMocks()
  // Default: no active session
  mockGetSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
})

describe('apiFetcher', () => {
  it('adds Authorization header when session has access_token', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: { access_token: 'test-token-123' } as never,
      },
      error: null,
    })

    const mockResponse = { ok: true, json: () => Promise.resolve({ value: 1 }) }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    await apiFetcher('/api/v1/test')

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    )
  })

  it('does not add Authorization header when no session exists', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ value: 1 }) }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    await apiFetcher('/api/v1/test')

    const calledHeaders = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>
    expect(calledHeaders['Authorization']).toBeUndefined()
  })

  it('throws an error when response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    await expect(apiFetcher('/api/v1/test')).rejects.toThrow('API error 401: Unauthorized')
  })

  it('unwraps envelope {data, meta} to just data', async () => {
    const envelope = {
      data: [{ id: '1', name: 'SPY' }],
      meta: { timestamp: '2026-01-01T00:00:00Z', request_id: 'abc' },
    }
    const mockResponse = { ok: true, json: () => Promise.resolve(envelope) }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const result = await apiFetcher('/api/v1/test')

    expect(result).toEqual([{ id: '1', name: 'SPY' }])
  })

  it('returns raw JSON when no envelope is present', async () => {
    const raw = { ticker: 'AAPL', price: 150 }
    const mockResponse = { ok: true, json: () => Promise.resolve(raw) }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const result = await apiFetcher('/api/v1/test')

    expect(result).toEqual({ ticker: 'AAPL', price: 150 })
  })
})
