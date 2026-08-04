import { useQuery } from '@tanstack/react-query'
import { API } from './apiConfig'

const HONO_API = API.hono

export type TAPublicSummary = {
  score?: number
  trend?: string
  confidence?: string
  summary_text?: string
  rsi?: number
  macd_status?: string
  regime?: string
  sma?: { sma_20?: number; sma_50?: number; sma_200?: number }
  nearest_support?: number
  nearest_resistance?: number
  _blocked?: boolean
  _requires?: string
  [key: string]: unknown
}

type TAResponse = TAPublicSummary | null

function isMarketOpen(): boolean {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false })
  const hour = parseInt(now.split(', ')[1]?.split(':')[0] || '0')
  const weekday = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' })
  if (['Sat', 'Sun'].includes(weekday)) return false
  return hour >= 9 && hour < 18
}

function marketStaleTime(openShort: number, closedLong: number): number {
  return isMarketOpen() ? openShort : closedLong
}

async function fetchFromTA(endpoint: string): Promise<TAResponse> {
  const res = await fetch(`${HONO_API}/api/v1/ta${endpoint}`)
  if (!res.ok) {
    if (res.status === 403) return { _blocked: true, _requires: 'subscriber' }
    return null
  }
  return res.json() as Promise<TAPublicSummary>
}

function useTAPublicSummary(ticker: string) {
  return useQuery({
    queryKey: ['ta', 'public', ticker],
    queryFn: () => fetchFromTA(`/public/${ticker}/summary`),
    staleTime: marketStaleTime(300_000, 3_600_000),
    gcTime: 30 * 60 * 1000,
    retry: 2,
    enabled: !!ticker,
  })
}

function useTAMemberSummary(ticker: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ta', 'member', ticker],
    queryFn: () => fetchFromTA(`/member/${ticker}/summary`),
    staleTime: marketStaleTime(300_000, 3_600_000),
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!ticker && enabled,
  })
}

function useTAFullAnalysis(ticker: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ta', 'full', ticker],
    queryFn: () => fetchFromTA(`/full/${ticker}`),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 0,
    enabled: !!ticker && enabled,
  })
}

export { useTAPublicSummary, useTAMemberSummary, useTAFullAnalysis, fetchFromTA }
