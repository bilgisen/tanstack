import { useQuery } from '@tanstack/react-query'

const HONO_API = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

function isMarketOpen(): boolean {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false })
  const hour = parseInt(now.split(', ')[1]?.split(':')[0] || '0')
  const weekday = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' })
  if (['Sat', 'Sun'].includes(weekday)) return false
  return hour >= 9 && hour < 17
}

function marketStaleTime(openShort: number, closedLong: number): number {
  return isMarketOpen() ? openShort : closedLong
}

type Industry = {
  slug: string
  name: string
  companyCount: number
  activeCompanies: number
  reliability: string
}

export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/sectors/industries`)
      if (!res.ok) throw new Error('Failed to fetch industries')
      return await res.json() as { success: boolean; data: Industry[]; total: number }
    },
    staleTime: 3_600_000,
    gcTime: 86_400_000,
    refetchOnReconnect: false,
  })
}

export function useIndustryDetail(slug: string) {
  return useQuery({
    queryKey: ['industry', slug],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/sectors/industries/${slug}`)
      if (!res.ok) throw new Error(`Failed to fetch industry ${slug}`)
      return await res.json()
    },
    staleTime: 1_800_000,
    gcTime: 86_400_000,
    enabled: !!slug,
    refetchOnReconnect: false,
  })
}

export function useCompanyData(ticker: string) {
  return useQuery({
    queryKey: ['company', 'data', ticker],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/market/symbol/${ticker}/company-data`)
      if (!res.ok) throw new Error(`Failed to fetch company data for ${ticker}`)
      return await res.json()
    },
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    enabled: !!ticker,
    refetchOnReconnect: false,
  })
}

export function useCompanyRatios(ticker: string) {
  return useQuery({
    queryKey: ['company', 'ratios', ticker],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/market/symbol/${ticker}/fundamental`)
      if (!res.ok) throw new Error(`Failed to fetch ratios for ${ticker}`)
      return await res.json()
    },
    staleTime: marketStaleTime(60_000, 3_600_000),
    gcTime: 86_400_000,
    enabled: !!ticker,
    refetchOnReconnect: false,
  })
}

export function useCompanyProfile(ticker: string) {
  return useQuery({
    queryKey: ['company', 'profile', ticker],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/market/symbol/${ticker}/company-profile`)
      if (!res.ok) throw new Error(`Failed to fetch company profile for ${ticker}`)
      return await res.json() as {
        ticker: string
        unvan?: string
        kurulus?: string
        faaliyet?: string
        telefon?: string
        faks?: string
        adres?: string
        shareholders?: { name: string; share_pct?: number }[]
      }
    },
    staleTime: 86_400_000,
    gcTime: 86_400_000,
    enabled: !!ticker,
    refetchOnReconnect: false,
  })
}

export function useCompanyQuote(ticker: string) {
  return useQuery({
    queryKey: ['company', 'quote', ticker],
    queryFn: async () => {
      const res = await fetch(`${HONO_API}/api/market/symbol/${ticker}`)
      if (!res.ok) throw new Error(`Failed to fetch quote for ${ticker}`)
      return await res.json()
    },
    staleTime: marketStaleTime(10_000, 3_600_000),
    gcTime: 86_400_000,
    enabled: !!ticker,
    refetchOnReconnect: false,
  })
}
