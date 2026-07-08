import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

type StockItem = {
  code: string
  last_price: number
  diff_percent: number
  volume: number
  name?: string
}

type SummaryItem = {
  code: string
  last_price: number
  diff_percent: number
}

async function fetchStocks(): Promise<StockItem[]> {
  const res = await fetch(`${API_URL}/api/market/stocks`)
  if (!res.ok) throw new Error('Failed to fetch stocks')
  const json = await res.json()
  return json?.data || []
}

async function fetchSummary(): Promise<SummaryItem[]> {
  const res = await fetch(`${API_URL}/api/market/summary`)
  if (!res.ok) throw new Error('Failed to fetch summary')
  const json = await res.json()
  return json?.data || []
}

async function fetchTASummary(code: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/market/symbol/${code}/ta/summary`)
  if (!res.ok) throw new Error(`Failed to fetch TA summary for ${code}`)
  return await res.json()
}

async function fetchHistory(code: string, limit = 150): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/market/symbol/${code}/history?limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to fetch history for ${code}`)
  const json = await res.json()
  return json?.data || json?.history || (Array.isArray(json) ? json : [])
}

const STALE = 120_000

export function useMarketStocks() {
  return useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: fetchStocks,
    staleTime: STALE,
    refetchInterval: STALE,
  })
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market', 'summary'],
    queryFn: fetchSummary,
    staleTime: STALE,
    refetchInterval: STALE,
  })
}

export function useTASummary(code: string) {
  return useQuery({
    queryKey: ['ta', 'summary', code],
    queryFn: () => fetchTASummary(code),
    staleTime: 300_000,
    enabled: !!code,
  })
}

export function useHistory(code: string, limit = 150) {
  return useQuery({
    queryKey: ['history', code, limit],
    queryFn: () => fetchHistory(code, limit),
    staleTime: 300_000,
    enabled: !!code,
  })
}
