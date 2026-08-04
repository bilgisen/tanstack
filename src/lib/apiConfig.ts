export const API = {
  hono: import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com',
  finveri: import.meta.env.VITE_FINVERI_API_URL || 'https://tekapi.jetborsa.com',
  market: '/api/market',
} as const
