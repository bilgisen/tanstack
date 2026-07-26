import { useQuery } from '@tanstack/react-query'

function isMarketOpen(): boolean {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false })
  const hour = parseInt(now.split(', ')[1]?.split(':')[0] || '0')
  const weekday = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' })
  if (['Sat', 'Sun'].includes(weekday)) return false
  return hour >= 9 && hour < 18
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
  name?: string
  title?: string
}

type IndexItem = {
  code: string
  last_price: number
  diff_percent: number
  name?: string
}

type IndexDetailData = {
  last?: number
  high?: number
  low?: number
  open?: number
  close?: number
  volume?: number
  change?: number
  changePercent?: number
  weekClose?: number
  monthClose?: number
  yearClose?: number
  updateDate?: string
  components?: unknown[]
  sector_distribution?: unknown[]
  [key: string]: unknown
}

type SektorItem = {
  sector_name?: string
  ratio?: number
  code?: string
  [key: string]: unknown
}

type HistoryItem = Record<string, unknown>

const API_BASE = '/api/market'

async function fetchStocks(): Promise<StockItem[]> {
  const res = await fetch(`${API_BASE}/stocks`)
  if (!res.ok) throw new Error('Failed to fetch stocks')
  const json = await res.json()
  return json?.data || []
}

async function fetchSummary(): Promise<SummaryItem[]> {
  const res = await fetch(`${API_BASE}/summary`)
  if (!res.ok) throw new Error('Failed to fetch summary')
  const json = await res.json()
  return json?.data || []
}

async function fetchIndices(): Promise<IndexItem[]> {
  const res = await fetch(`${API_BASE}/indices`)
  if (!res.ok) throw new Error('Failed to fetch indices')
  const json = await res.json()
  return json?.data || []
}

async function fetchIndexDetail(code: string): Promise<IndexDetailData | null> {
  const res = await fetch(`${API_BASE}/indices/${code}`)
  if (!res.ok) throw new Error(`Failed to fetch index detail for ${code}`)
  const json = await res.json()
  return json?.data || null
}

async function fetchTASummary(code: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/symbol/${code}/ta/summary`)
  if (!res.ok) throw new Error(`Failed to fetch TA summary for ${code}`)
  return await res.json()
}

async function fetchSektorDagilimi(code: string): Promise<SektorItem[]> {
  const res = await fetch(`${API_BASE}/indices/${code}/sector`)
  if (!res.ok) return []
  const json = await res.json()
  return json?.data || []
}

async function fetchHistory(code: string, limit = 150): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/symbol/${code}/history?limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to fetch history for ${code}`)
  const json = await res.json()
  return json?.data || json?.history || (Array.isArray(json) ? json : [])
}

function marketStaleTime(openShort: number, closedLong: number): number {
  return isMarketOpen() ? openShort : closedLong
}

function marketRefetchInterval(openShort: number, closedLong: number | false): number | false {
  return isMarketOpen() ? openShort : closedLong
}

export function useMarketStocks() {
  return useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: fetchStocks,
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketRefetchInterval(120_000, false),
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
  })
}

export function useIndices() {
  return useQuery({
    queryKey: ['indices', 'all'],
    queryFn: fetchIndices,
    staleTime: 0,
    gcTime: 300_000,
    refetchInterval: marketRefetchInterval(120_000, false),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  })
}

export function useIndexDetail(code: string) {
  return useQuery({
    queryKey: ['indices', 'detail', code],
    queryFn: () => fetchIndexDetail(code),
    staleTime: 0,
    gcTime: 300_000,
    refetchInterval: marketRefetchInterval(120_000, false),
    enabled: !!code,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  })
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market', 'summary'],
    queryFn: fetchSummary,
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    refetchInterval: marketRefetchInterval(120_000, false),
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

export function useSektorDagilimi(code: string) {
  return useQuery({
    queryKey: ['sector', code],
    queryFn: () => fetchSektorDagilimi(code),
    staleTime: 3600_000,
    gcTime: 3600_000,
    enabled: !!code,
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
