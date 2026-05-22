import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../../../lib/auth'

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
          throw error
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
          throw error
        }
      },
    },
  },
})
