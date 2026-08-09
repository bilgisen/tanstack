import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API } from './apiConfig'

export type KAPAnalysis = {
  disclosure_index: string
  title?: string | null
  subject?: string | null
  publish_date?: string | null
  importance_score: number | null
  category: string
  time_horizon: string | null
  needs_review: number
  sentiment?: string | null
  confidence?: number | null
  summary_tr?: string | null
  impact_analysis?: string | null
  key_numbers?: Record<string, unknown> | null
  ai_model_used?: string | null
  analyzed_at?: string | null
  source?: string | null
  updated_at?: string | null
  tickers?: Array<string>
}

export type KAPNotification = {
  disclosure_index: string
  title: string
  subject: string
  disclosure_class: string | null
  disclosure_type: string | null
  disclosure_category: string | null
  publish_date: string
  is_late: number
  is_changed: number
  is_bist100: number
  attachment_count: number | null
  summary: string | null
  modified_date?: string | null
  mkk_member_id?: string | null
  related_disclosure_oid?: string | null
  pdf_error?: number | null
  analysis?: KAPAnalysis | null
  importance_score?: number | null
  summary_tr?: string | null
}

export type KAPFeedResponse = {
  total: number
  page: number
  limit: number
  notifications: Array<KAPNotification>
}

export type KAPCompanyResponse = {
  total: number
  ticker: string
  days: number
  latest_financial_report: KAPAnalysis | null
  notifications: Array<KAPNotification>
}

export type KAPDetailResponse = KAPNotification & {
  analysis?: KAPAnalysis | null
  importance_score?: number | null
  summary_tr?: string | null
  impact_analysis?: string | null
  key_numbers?: Array<Record<string, unknown>> | null
  sentiment?: string | null
  confidence?: number | null
  ai_model_used?: string | null
  analyzed_at?: string | null
  kap_link: string
  pdf_link: string
  tickers: Array<string>
  chatbot_context?: string | null
}

export type KAPFilter = {
  importance?: string
  category?: string
  stock?: string
  bist100?: boolean
  page?: number
  limit?: number
  enabled?: boolean
}

const KAP_BASE = API.hono

function buildKAPQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function fetchKAPFeed(filters: KAPFilter): Promise<KAPFeedResponse> {
  const res = await fetch(
    `${KAP_BASE}/api/notifications${buildKAPQuery({
      importance: filters.importance,
      category: filters.category,
      stock: filters.stock,
      bist100: filters.bist100 ? '1' : undefined,
      page: filters.page || 1,
      limit: filters.limit || 25,
    })}`
  )
  if (!res.ok) throw new Error(`KAP feed hatası: ${res.status}`)
  const json = (await res.json()) as KAPFeedResponse
  return json
}

async function fetchKAPCompany(ticker: string, days = 90): Promise<KAPCompanyResponse> {
  const res = await fetch(`${KAP_BASE}/api/notifications/${encodeURIComponent(ticker)}?days=${days}`)
  if (!res.ok) throw new Error(`KAP şirket hatası: ${res.status}`)
  return (await res.json()) as KAPCompanyResponse
}

async function fetchKAPDetail(disclosureId: string): Promise<KAPDetailResponse> {
  const res = await fetch(`${KAP_BASE}/api/notifications/detail/${encodeURIComponent(disclosureId)}`)
  if (!res.ok) throw new Error(`KAP detay hatası: ${res.status}`)
  return (await res.json()) as KAPDetailResponse
}

async function requestKAPAnalysis(disclosureId: string): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`${KAP_BASE}/api/notifications/detail/${encodeURIComponent(disclosureId)}/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) {
    let message = `Analiz isteği başarısız (${res.status})`
    try {
      const j = (await res.json()) as { error?: string }
      if (j?.error) message = j.error
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return (await res.json()) as { ok: boolean; message?: string }
}

function KAPStaleTime(): number {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false })
  const hour = parseInt(now.split(', ')[1]?.split(':')[0] || '0')
  const weekday = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' })
  if (['Sat', 'Sun'].includes(weekday)) return 60_000
  return hour >= 9 && hour < 18 ? 60_000 : 300_000
}

export function useKAPFeed(filters: KAPFilter) {
  return useQuery({
    queryKey: ['kap', 'feed', filters.importance, filters.category, filters.stock, filters.bist100 ? 1 : 0, filters.page || 1, filters.limit || 25],
    queryFn: () => fetchKAPFeed(filters),
    staleTime: KAPStaleTime(),
    gcTime: 3_600_000,
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
    enabled: filters.enabled !== false,
  })
}

export function useKAPCompany(ticker: string, days = 90) {
  return useQuery({
    queryKey: ['kap', 'company', ticker.toUpperCase(), days],
    queryFn: () => fetchKAPCompany(ticker.toUpperCase(), days),
    staleTime: KAPStaleTime(),
    gcTime: 3_600_000,
    enabled: !!ticker,
    refetchOnReconnect: false,
  })
}

export function useKAPDetail(disclosureId: string) {
  return useQuery({
    queryKey: ['kap', 'detail', disclosureId],
    queryFn: () => fetchKAPDetail(disclosureId),
    staleTime: 300_000,
    gcTime: 3_600_000,
    enabled: !!disclosureId,
    refetchOnReconnect: false,
  })
}

export function useKAPAnalyze(disclosureId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => requestKAPAnalysis(disclosureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kap', 'detail', disclosureId] })
      queryClient.invalidateQueries({ queryKey: ['kap', 'feed'] })
    },
  })
}