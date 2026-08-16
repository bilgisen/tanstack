import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWatchlistStore } from '../store/watchlist'
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
  /** S12: feed yanıtıyla gelen ticker listesi (takip vurgusu için) */
  tickers?: Array<string>
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
  audit?: Record<string, string | boolean> | null
  attachments?: Array<{ obj_id: string; file_name: string | null; file_extension: string | null }>
  has_body?: boolean
}

export type KAPDetailBodyResponse = {
  disclosure_body?: string | null
  audit?: Record<string, string | boolean> | null
  attachments?: Array<{ obj_id: string; file_name: string | null; file_extension: string | null }>
}

export type KAPFilter = {
  importance?: string
  category?: string
  stock?: string
  bist100?: boolean
  index?: string
  sector?: string
  page?: number
  limit?: number
  enabled?: boolean
  stocks?: Array<string>
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
      index: filters.index,
      sector: filters.sector,
      bist100: filters.bist100 ? '1' : undefined,
      stocks: filters.stocks && filters.stocks.length > 0 ? filters.stocks.join(',') : undefined,
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

async function fetchKAPDetailBody(disclosureId: string): Promise<KAPDetailBodyResponse> {
  const res = await fetch(`${KAP_BASE}/api/notifications/detail/${encodeURIComponent(disclosureId)}/body`)
  if (!res.ok) throw new Error(`KAP metin hatası: ${res.status}`)
  // Fetch JSON with explicit UTF-8 handling
  const text = await res.text()
  // Normalize encoding: if response is JSON, parse it directly (res.json() handles UTF-8)
  // But for safety, manually parse to ensure proper encoding
  return JSON.parse(text) as KAPDetailBodyResponse
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
  const stocksKey = (filters.stocks ?? []).slice().sort().join(',')
  return useQuery({
    queryKey: ['kap', 'feed', filters.importance, filters.category, filters.stock, filters.index || '', filters.sector || '', filters.bist100 ? 1 : 0, stocksKey, filters.page || 1, filters.limit || 25],
    queryFn: () => fetchKAPFeed(filters),
    staleTime: KAPStaleTime(),
    gcTime: 3_600_000,
    placeholderData: (prev) => prev,
    refetchOnReconnect: false,
    enabled: filters.enabled !== false,
  })
}

/** S12-1: tüm takip listelerindeki hisse sembollerinin Set'i (endeksler hariç). */
export function useTrackedSymbols(): Set<string> {
  const watchlists = useWatchlistStore((s) => s.watchlists)
  return useMemo(() => {
    const set = new Set<string>()
    for (const w of watchlists) {
      for (const it of w.items) {
        if (it.type === 'stock') set.add(it.symbol.toUpperCase())
      }
    }
    return set
  }, [watchlists])
}

/** S13-3: anonim ziyaretçi kimliği (localStorage'da kalıcı, kripto rastgele). */
export function getAnonId(): string {
  try {
    const KEY = 'hissepro_anon_id'
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return ''
  }
}

/** S13-3: KAP tıklama/okunma logu — fire-and-forget, hatalar sessiz. */
export function logKAPClick(disclosureIndex: string, source: 'feed_card' | 'detail' | 'daily_view' | 'daily_item') {
  try {
    void fetch(`${KAP_BASE}/api/clicks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disclosure_index: disclosureIndex, source, anon_id: getAnonId() }),
    }).catch(() => {})
  } catch {
    /* log kaydı kritik değil */
  }
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

/** Detay sayfasında on-demand: ağır bildirim metni + denetim + ekler (S5: görüntülenenler). */
export function useKAPDetailBody(disclosureId: string | null) {
  return useQuery({
    queryKey: ['kap', 'detail', 'body', disclosureId],
    queryFn: () => fetchKAPDetailBody(disclosureId as string),
    staleTime: 3_600_000,
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

// ── Gün Sonu Sentez (S11-5) ──────────────────────────────────────────────

export type DailySynthesisItem = {
  ticker: string
  neOldu: string
  nedenOnemli: string
  yon: 'olumlu' | 'olumsuz' | 'notr'
}

export type DailySynthesis = {
  ok: boolean
  date: string
  headline: string
  items: Array<DailySynthesisItem>
  overlooked: Array<string>
}

/** TR günü (UTC+3) — "YYYY-MM-DD" */
export function trTodayISO(): string {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10)
}

async function fetchDailySynthesis(date: string): Promise<DailySynthesis> {
  const res = await fetch(`${KAP_BASE}/api/daily?date=${encodeURIComponent(date)}`)
  if (!res.ok) {
    let message = `Gün sonu sentez hatası (${res.status})`
    try {
      const j = (await res.json()) as { error?: string }
      if (j?.error) message = j.error
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return (await res.json()) as DailySynthesis
}

export function useDailySynthesis(date: string) {
  return useQuery({
    queryKey: ['kap', 'daily', date],
    queryFn: () => fetchDailySynthesis(date),
    staleTime: 10 * 60_000,
    gcTime: 24 * 3_600_000,
    enabled: !!date,
    refetchOnReconnect: false,
  })
}