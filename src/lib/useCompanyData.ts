import { useQuery } from '@tanstack/react-query'

const HONO_API = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

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
    enabled: !!slug,
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
    staleTime: 120_000,
    enabled: !!ticker,
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
    staleTime: 300_000,
    enabled: !!ticker,
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
    enabled: !!ticker,
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
    staleTime: 120_000,
    enabled: !!ticker,
  })
}
