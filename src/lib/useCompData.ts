import { useQuery } from '@tanstack/react-query'

const HONO_API = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

async function fetchComp(endpoint: string) {
  const res = await fetch(`${HONO_API}/api/v1/comp${endpoint}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Comp API ${res.status}`)
  }
  return res.json()
}

export function useCompScore(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'score', ticker],
    queryFn: () => fetchComp(`/score/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompProfile(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'profile', ticker],
    queryFn: () => fetchComp(`/companies/${ticker}/profile`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompRatios(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'ratios', ticker],
    queryFn: () => fetchComp(`/companies/${ticker}/ratios`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompStatements(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'statements', ticker],
    queryFn: () => fetchComp(`/companies/${ticker}/statements`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompTrends(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'trends', ticker],
    queryFn: () => fetchComp(`/companies/${ticker}/trends`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompContext(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'context', ticker],
    queryFn: () => fetchComp(`/ai/context/${ticker}`),
    staleTime: 1_800_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompAnalysis(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'analysis', ticker],
    queryFn: () => fetchComp(`/ai/analysis/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompSwot(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'swot', ticker],
    queryFn: () => fetchComp(`/ai/swot/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompFundamentalReport(ticker: string) {
  return useQuery({
    queryKey: ['comp', 'fa-report', ticker],
    queryFn: () => fetchComp(`/ai/fundamental-report/${ticker}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
  })
}

export function useCompRankings(scope: string, name: string) {
  return useQuery({
    queryKey: ['comp', 'rankings', scope, name],
    queryFn: () => fetchComp(`/rankings/${scope}/${encodeURIComponent(name)}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!scope && !!name,
  })
}

export function useCompSectorDetail(name: string) {
  return useQuery({
    queryKey: ['comp', 'sector', name],
    queryFn: () => fetchComp(`/sectors/${encodeURIComponent(name)}`),
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    enabled: !!name,
  })
}
