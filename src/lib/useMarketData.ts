import { useQuery } from '@tanstack/react-query'
import { API } from './apiConfig'

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
  change_week_pct?: number | null
  change_month_pct?: number | null
  change_ytd_pct?: number | null
  change_year_pct?: number | null
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
  volume?: number
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
  components?: Array<unknown>
  sector_distribution?: Array<unknown>
  [key: string]: unknown
}

type SektorItem = {
  nameTr?: string
  nameEng?: string
  value?: number
  [key: string]: unknown
}

export type IndexComponentItem = {
  code: string
  last_price: number | null
  diff_percent: number | null
  change_week_pct: number | null
  change_month_pct: number | null
  change_ytd_pct: number | null
  change_year_pct: number | null
  volume: number | null
}

type IndexComponentsResponse = {
  success: boolean
  total: number
  data: Array<IndexComponentItem>
}

type HistoryItem = Record<string, unknown>

const API_BASE = API.market

async function fetchStocks(): Promise<Array<StockItem>> {
  const res = await fetch(`${API_BASE}/stocks`)
  if (!res.ok) throw new Error('Failed to fetch stocks')
  const json = await res.json()
  return json?.data || []
}

async function fetchSummary(): Promise<Array<SummaryItem>> {
  const res = await fetch(`${API_BASE}/summary`)
  if (!res.ok) throw new Error('Failed to fetch summary')
  const json = await res.json()
  return json?.data || []
}

async function fetchIndices(): Promise<Array<IndexItem>> {
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

async function fetchSektorDagilimi(code: string): Promise<Array<SektorItem>> {
  const res = await fetch(`${API_BASE}/indices/${code}/sector`)
  if (!res.ok) return []
  const json = await res.json()
  return json?.data || []
}

async function fetchHistory(code: string, limit = 150): Promise<Array<HistoryItem>> {
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
    staleTime: marketStaleTime(120_000, 3_600_000),
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
    staleTime: marketStaleTime(120_000, 3_600_000),
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
    staleTime: marketStaleTime(300_000, 3_600_000),
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

async function fetchIndexComponents(code: string, limit: number, offset: number): Promise<IndexComponentsResponse> {
  const res = await fetch(`${API_BASE}/indices/${code}/components?limit=${limit}&offset=${offset}`)
  if (!res.ok) return { success: false, total: 0, data: [] }
  return await res.json()
}

type HistoryCacheStatus = { cached: boolean; source: 'mem' | 'kv' | 'none' }

export function useHistoryCacheStatus(code: string) {
  return useQuery({
    queryKey: ['history-status', code],
    queryFn: async (): Promise<HistoryCacheStatus> => {
      const res = await fetch(`${API_BASE}/symbol/${code}/history/status`)
      if (!res.ok) return { cached: false, source: 'none' }
      return res.json()
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    enabled: !!code,
    refetchOnReconnect: false,
  })
}

export function useIndexComponents(code: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['index-components', code, limit, offset],
    queryFn: () => fetchIndexComponents(code, limit, offset),
    staleTime: 120_000,
    gcTime: 300_000,
    enabled: !!code,
  })
}
