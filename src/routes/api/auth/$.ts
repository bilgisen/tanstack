import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

const getDebugErrorResponse = (error: any) => {
  const env = typeof process !== 'undefined' ? process.env : {};
  return new Response(JSON.stringify({
    error: error?.message || String(error),
    stack: error?.stack,
    env_checklist: {
      has_DATABASE_URL: !!env?.DATABASE_URL,
      has_BETTER_AUTH_SECRET: !!env?.BETTER_AUTH_SECRET,
      has_GOOGLE_CLIENT_ID: !!env?.GOOGLE_CLIENT_ID,
      has_GOOGLE_CLIENT_SECRET: !!env?.GOOGLE_CLIENT_SECRET,
      BETTER_AUTH_URL: env?.BETTER_AUTH_URL || "undefined",
    }
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.log('[Auth API GET]', request.method, request.url)
        try {
          const res = await auth.handler(request)
          console.log('[Auth API GET Response]', res.status)
          return res
        } catch (error) {
          console.error('[Auth API GET Error]', error)
          return getDebugErrorResponse(error)
        }
      },
      POST: async ({ request }) => {
        console.log('[Auth API POST]', request.method, request.url)
        try {
          const res = await auth.handler(request)
          console.log('[Auth API POST Response]', res.status)
          return res
        } catch (error) {
          console.error('[Auth API POST Error]', error)
          return getDebugErrorResponse(error)
        }
      },
    },
  },
})
