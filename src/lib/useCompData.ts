import { useQuery } from '@tanstack/react-query'

export const HONO_API = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

// ── API Response Interfaces ──

export interface AnalysisScore {
  genel?: number
  karlilik?: number
  finansal?: number
  degerleme?: number
  verimlilik?: number
}

export interface AnalysisResponse {
  score?: AnalysisScore
  key_metrics?: Record<string, { name: string; value: number }>
  key_insights?: Array<{ insight: string; category: string; importance: number; data?: Record<string, unknown> }>
  executive_summary?: string
  sector_position?: { sector_rank: number; n_peers: number }
}

export interface CompScorePillar {
  score: number
  label?: string
  details?: Array<{
    ratio_code: string
    peer_median: number
    company_value: number
    percentile?: number
    direction?: string
  }>
}

export interface CompScoreResponse {
  composite_score: number
  percentile?: number
  company_name?: string
  sector?: string
  reliability?: string
  genel?: number
  karlilik?: number
  finansal?: number
  degerleme?: number
  verimlilik?: number
  absolute?: { score: number; label: string }
  ranks?: {
    sector?: { percentile: number; n_peers: number }
    group?: { percentile: number; n_peers?: number }
  }
  pillars?: Record<string, CompScorePillar>
  benchmark?: Record<string, unknown>
  ratios?: Record<string, number | null>
}

export interface CompProfileResponse {
  sector?: string
  sector_main?: string
  industry?: string
  financial_group_label?: string
  company_name?: string
  market_data?: { market_cap?: number }
  [key: string]: unknown
}

export interface RatioEntry {
  code: string
  value: number
  sector_context?: { median?: number }
}

export interface CompRatiosResponse {
  ratios: Array<RatioEntry>
}

export interface CompTrendsResponse {
  trends: Record<string, Array<{ period: string; value: number }>>
}

export interface SwotResponse {
  strengths?: Array<{ item: string } | string>
  weaknesses?: Array<{ item: string } | string>
  opportunities?: Array<{ item: string } | string>
  threats?: Array<{ item: string } | string>
}

export interface FundamentalReportResponse {
  financial_health?: {
    score?: { genel?: number }
    overall?: string
  }
  executive_summary?: string
  ratios?: Record<string, number | null>
  disclaimer?: string
}

export interface CeoReportPattern {
  name: string
  direction: string
  reliability?: string
  confidence?: number
}

export interface CeoReportMovingAverages {
  sma_20: number
  sma_50: number
  sma_200: number
  ema_9: number
  ema_21: number
  price_vs_sma20: string
  price_vs_sma50: string
  price_vs_sma200: string
  price_vs_ema9: string
  price_vs_ema21: string
  golden_cross?: boolean
}

export interface CeoReportIndicators {
  rsi: { value: number; status: string; interpretation: string }
  macd: { macd_line: number; signal_line: number; histogram: number; interpretation: string }
  stochastic?: { k: number; d: number; status: string }
  supertrend?: { direction: string; value: number }
  adx_details?: { adx: number; efficiency_ratio: number }
  vwap?: number | null
  moving_averages: CeoReportMovingAverages
  volatility: { atr: number; atr_percent: number; bollinger_lower: number; bollinger_upper: number }
  volume: { mfi: number; obv_trend: string }
}

export interface CeoReportScenario {
  name: string
  probability: string
  conditions: Array<string>
  target?: string
  strategy?: string
  risk?: string
}

export interface CeoReportResponse {
  overview: {
    technical_score: number
    confidence: number
    market_regime: string
    trend_direction: string
    price_character: string
    volatility_regime?: string
    score_components?: { trend: number; momentum: number; volume: number; pattern: number }
  }
  executive_summary?: string
  current_price: number
  key_levels: {
    support_1: { price: number; importance: string; scenario: string }
    support_2: { price: number; importance: string; scenario: string }
    resistance_1: { price: number; importance: string; scenario: string }
    resistance_2: { price: number; importance: string; scenario: string }
    stop_loss: number
    take_profit: number
    risk_reward_ratio: number
  }
  indicators: CeoReportIndicators
  scenarios: {
    positive: CeoReportScenario
    neutral: CeoReportScenario
    negative: CeoReportScenario
  }
  patterns?: {
    active_count: number
    candlestick?: Array<CeoReportPattern>
    chart?: Array<CeoReportPattern>
  }
  volume_profile?: {
    poc: number
    value_area_low: number
    value_area_high: number
    interpretation?: string
  }
  izlenmesi_gerekenler?: {
    not: string
    kritik_seviyeler?: Array<string>
    izlenecek_konular?: Array<string>
  }
  ai_analysis?: {
    sonuc: Array<string>
  }
  unit?: string
}

async function fetchComp<T = unknown>(endpoint: string): Promise<T | null> {
  const res = await fetch(`${HONO_API}/api/v1/comp${endpoint}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Comp API ${res.status}`)
  }
  return res.json()
}

export function useCompScore(ticker: string) {
  return useQuery<CompScoreResponse | null>({
    queryKey: ['comp', 'score', ticker],
    queryFn: () => fetchComp<CompScoreResponse>(`/score/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompProfile(ticker: string) {
  return useQuery<CompProfileResponse | null>({
    queryKey: ['comp', 'profile', ticker],
    queryFn: () => fetchComp<CompProfileResponse>(`/companies/${ticker}/profile`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompRatios(ticker: string) {
  return useQuery<CompRatiosResponse | null>({
    queryKey: ['comp', 'ratios', ticker],
    queryFn: () => fetchComp<CompRatiosResponse>(`/companies/${ticker}/ratios`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompStatements(ticker: string) {
  return useQuery<Record<string, unknown> | null>({
    queryKey: ['comp', 'statements', ticker],
    queryFn: () => fetchComp<Record<string, unknown>>(`/companies/${ticker}/statements`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompTrends(ticker: string) {
  return useQuery<CompTrendsResponse | null>({
    queryKey: ['comp', 'trends', ticker],
    queryFn: () => fetchComp<CompTrendsResponse>(`/companies/${ticker}/trends`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompContext(ticker: string) {
  return useQuery<Record<string, unknown> | null>({
    queryKey: ['comp', 'context', ticker],
    queryFn: () => fetchComp<Record<string, unknown>>(`/ai/context/${ticker}`),
    staleTime: 1_800_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompAnalysis(ticker: string) {
  return useQuery<AnalysisResponse | null>({
    queryKey: ['comp', 'analysis', ticker],
    queryFn: () => fetchComp<AnalysisResponse>(`/ai/analysis/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompSwot(ticker: string) {
  return useQuery<SwotResponse | null>({
    queryKey: ['comp', 'swot', ticker],
    queryFn: () => fetchComp<SwotResponse>(`/ai/swot/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompFundamentalReport(ticker: string) {
  return useQuery<FundamentalReportResponse | null>({
    queryKey: ['comp', 'fa-report', ticker],
    queryFn: () => fetchComp<FundamentalReportResponse>(`/ai/fundamental-report/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompRankings(scope: string, name?: string) {
  const isMarket = scope === 'market' || (!name && scope)
  const path = isMarket
    ? `/rankings/${scope}`
    : `/rankings/${scope}/${encodeURIComponent(name || '')}`
  return useQuery<Record<string, unknown> | null>({
    queryKey: ['comp', 'rankings', scope, name || ''],
    queryFn: () => fetchComp<Record<string, unknown>>(path),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: isMarket ? !!scope : !!scope && !!name,
  })
}

export type ScreenerFilters = {
  sector?: string
  group?: string
  q?: string
  score_min?: number
  score_max?: number
  sort_by?: string
  sort_dir?: string
  [key: string]: string | number | undefined
}

export function useCompScreener(filters: ScreenerFilters) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
  }
  const qstr = qs.toString()
  return useQuery<Record<string, unknown> | null>({
    queryKey: ['comp', 'screener', qstr],
    queryFn: () => fetchComp<Record<string, unknown>>(`/screener/filter?${qstr}`),
    staleTime: 300_000,
    gcTime: 3_600_000,
    enabled: true,
  })
}

export function useCompSectorDetail(name: string) {
  return useQuery<SectorGroupDetail | null>({
    queryKey: ['comp', 'sector', name],
    queryFn: () => fetchComp<SectorGroupDetail>(`/sectors/${encodeURIComponent(name)}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!name,
  })
}

export interface CompCompareCompany {
  ticker: string
  company_name?: string
  sector?: string
  composite_score: number | null
  percentile?: number | null
  reliability?: string | null
  pillars?: Record<string, CompScorePillar>
  absolute?: { score: number | null; label: string | null } | null
  key_ratios?: Record<string, number | null>
  ratio_percentiles?: Record<string, number | null>
}

export interface CompCompareResponse {
  tickers: Array<CompCompareCompany>
}

export function useCompCompare(tickers: Array<string>) {
  const joined = tickers.filter(Boolean).join(',')
  return useQuery<CompCompareResponse | null>({
    queryKey: ['comp', 'compare', joined],
    queryFn: () => fetchComp<CompCompareResponse>(`/compare/${joined}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: joined.length > 0 && tickers.length >= 2,
  })
}

export async function fetchCompCompareContext(tickers: Array<string>): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${HONO_API}/api/v1/comp/ai/compare-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickers }),
  })
  if (!res.ok) return null
  return res.json()
}

export function useSectorGroups() {
  return useQuery<SectorGroupsResponse | null>({
    queryKey: ['comp', 'sector-groups'],
    queryFn: () => fetchComp<SectorGroupsResponse>('/sectors'),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
  })
}

export type SectorGroupDetail = {
  sector?: string
  group?: string
  company_count: number
  benchmarks: Record<string, { median_ew: number; p25: number; p75: number; n_peers: number; reliability: string }>
  sector_score: { equal_weight: number | null; market_cap_weighted: number | null }
  leaderboard: Array<{
    ticker: string
    name: string
    sector_main?: string
    composite_score: number
    pillar_finansal_saglik: number | null
    pillar_karlilik_buyume: number | null
    pillar_degerleme: number | null
    reliability: string
    market_cap: number | null
    rank: number
  }>
}

export type SectorGroupsResponse = {
  sectors: Array<{ sector_main: string; cnt: number; consolidated: string | null; consolidated_name: string | null }>
  groups: Array<{ key: string; name: string; count: number }>
}

export interface RelationalSignal {
  pattern_id: string
  category: 'confirming' | 'conflicting' | 'warning' | 'opportunity'
  polarity: 'confirming' | 'conflicting'
  ratios_involved: Array<string>
  narrative_hint: string
  severity: number
  ratio_details: Record<string, { value: number | null; percentile: number | null; sector_median: number | null } | null>
}

export interface CompFundamentalsResponse {
  ticker: string
  company_name: string
  sector: string | null
  composite_score: number | null
  percentile?: number | null
  reliability: string | null
  pillars: Record<string, CompScorePillar> | null
  absolute: { score: number; label: string } | null
  ranks: {
    sector?: { percentile: number; n_peers: number }
    group?: { percentile: number; n_peers: number }
  } | null
  financial_health: { composite_score: number; absolute_score: number | null; absolute_label: string | null } | null
  sector_position: { benchmark_source: string; benchmark_name: string; n_peers: number; sector_rank: number; sector_percentile: number } | null
  profile: {
    sector_main: string | null
    industry: string | null
    financial_group_label: string | null
    market_cap: number | null
  } | null
  ratios: Record<string, {
    value: number | null
    name: string
    category: string
    higher_is_better: boolean
    sector_context?: { median: number; p25: number; p75: number; percentile: number; position: string }
    absolute_score?: number
    interpretation?: string
    locked?: boolean
  }>
  trends: {
    periods: Array<string>
    n_periods: number
    trends: Record<string, {
      values: Array<{ period: string; value: number }>
      direction: string
      momentum: string
      qoq_change: number | null
      yoy_change: number | null
      cagr: number | null
      volatility: number | null
      n_periods: number
      missing_periods: number
    }>
    sector_comparison: Record<string, { sector_median: number }> | null
  } | null
  key_insights: Array<{ insight: string; category: string; importance: number; data?: Record<string, unknown> }>
  relational_signals: Array<RelationalSignal>
  risk_assessment: {
    composite_risk_score: number
    risk_level: string
    indicators: Record<string, { score: number; level: string; factors: Array<{ factor: string; value: number; threshold: number; status: string }> }>
    risk_trends: Record<string, string> | null
    mitigation_factors: Array<string> | null
  } | null
  metadata: {
    period: string | null
    data_completeness: number | null
    missing_ratios: Array<string>
    available_sections?: Array<string>
  }
}

export interface FaNarrativeSection {
  id: string
  title: string
  content: string
  signals_used: Array<string>
  visual_hint: string
  ratios_referenced: Array<string>
}

export interface FaNarrativeReport {
  ticker: string
  report_type: string
  generated_at: string
  sections: Array<FaNarrativeSection>
  has_ai_enhancement: boolean
}

export function useCompFaReport(ticker: string) {
  return useQuery<FaNarrativeReport | null>({
    queryKey: ['comp', 'fa-report', ticker],
    queryFn: () => fetchComp<FaNarrativeReport>(`/ai/fa-report/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompFundamentals(ticker: string, scope: 'public' | 'member' | 'abone' = 'member') {
  return useQuery<CompFundamentalsResponse | null>({
    queryKey: ['comp', 'fundamentals', ticker, scope],
    queryFn: () => fetchComp<CompFundamentalsResponse>(`/fundamentals/${ticker}?scope=${scope}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}
