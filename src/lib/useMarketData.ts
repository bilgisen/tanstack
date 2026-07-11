import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

function isMarketOpen(): boolean {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false })
  const hour = parseInt(now.split(', ')[1]?.split(':')[0] || '0')
  const weekday = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' })
  if (['Sat', 'Sun'].includes(weekday)) return false
  return hour >= 9 && hour < 17
}

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

async function fetchIndices(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/market/indices`)
  if (!res.ok) throw new Error('Failed to fetch indices')
  const json = await res.json()
  return json?.data || []
}

async function fetchIndexDetail(code: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/market/indices/${code}`)
  if (!res.ok) throw new Error(`Failed to fetch index detail for ${code}`)
  const json = await res.json()
  return json?.data || null
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

function marketStaleTime(openShort: number, closedLong: number): number {
  return isMarketOpen() ? openShort : closedLong
}

export function useMarketStocks() {
  return useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: fetchStocks,
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketStaleTime(120_000, false),
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
  })
}

export function useIndices() {
  return useQuery({
    queryKey: ['indices', 'all'],
    queryFn: fetchIndices,
    staleTime: marketStaleTime(30_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketStaleTime(300_000, false),
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
  })
}

export function useIndexDetail(code: string) {
  return useQuery({
    queryKey: ['indices', 'detail', code],
    queryFn: () => fetchIndexDetail(code),
    staleTime: marketStaleTime(30_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketStaleTime(300_000, false),
    enabled: !!code,
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
  })
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market', 'summary'],
    queryFn: fetchSummary,
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketStaleTime(120_000, false),
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
  })
}

export function useTASummary(code: string) {
  return useQuery({
    queryKey: ['ta', 'summary', code],
    queryFn: () => fetchTASummary(code),
    staleTime: marketStaleTime(60_000, 3_600_000),
    gcTime: 3_600_000,
    enabled: !!code,
    refetchOnReconnect: false,
  })
}

export function useHistory(code: string, limit = 150) {
  return useQuery({
    queryKey: ['history', code, limit],
    queryFn: () => fetchHistory(code, limit),
    staleTime: 21_600_000,
    gcTime: 86_400_000,
    enabled: !!code,
    refetchOnReconnect: false,
  })
}
