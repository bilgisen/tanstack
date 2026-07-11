// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'

const HONO_URL = process.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'

function getCloudflareEnv(): any {
  try {
    const storageKey = Symbol.for('tanstack-start:event-storage')
    const storage = (globalThis as any)[storageKey]
    const store = storage?.getStore()
    const event = store?.h3Event || store
    if (event) {
      const cf = event.context?.cloudflare || event.req?.runtime?.cloudflare
      if (cf && cf.env) return cf.env
    }
  } catch {}
  return null
}

export const Route = createFileRoute('/api/tickers')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = getCloudflareEnv()
        const kv = env?.TANSTACK_KV_CACHE
        const cacheKey = 'tickers:data'

        let cached = null
        if (kv) {
          try { cached = await kv.get(cacheKey, { type: 'json' }) }
          catch {}
        }

        const headers: Record<string, string> = {}
        if (cached?.etag) headers['If-None-Match'] = cached.etag

        const response = await fetch(`${HONO_URL}/api/market/stocks`, { headers })

        if (response.status === 304 && cached) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
          })
        }

        if (response.status === 200) {
          const data = await response.json()
          const etag = response.headers.get('ETag') || ''
          if (kv) {
            try {
              await kv.put(cacheKey, JSON.stringify({ data, etag, timestamp: Date.now() }), { expirationTtl: 86400 })
            } catch {}
          }
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS', ETag: etag, 'Cache-Control': 'public, max-age=60' }
          })
        }

        if (cached) {
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' }
          })
        }

        return new Response(JSON.stringify({ error: 'Upstream unavailable' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  }
})
