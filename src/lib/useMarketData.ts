import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

type StockItem = {
  code: string
  last_price: number
  diff_percent: number
  volume: number
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

export function useMarketStocks() {
  return useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: fetchStocks,
    staleTime: 120_000,
    refetchInterval: 120_000,
  })
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market', 'summary'],
    queryFn: fetchSummary,
    staleTime: 120_000,
    refetchInterval: 120_000,
  })
}
