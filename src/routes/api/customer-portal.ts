import { createFileRoute } from '@tanstack/react-router'
import { CustomerPortal } from '@dodopayments/tanstack'

export const Route = createFileRoute('/api/customer-portal')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const res = await CustomerPortal({
          bearerToken: process.env.DODO_PAYMENTS_API_KEY,
          environment: process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' | undefined,
        })(request)
        return new Response(await res.text(), {
          status: res.status,
          statusText: res.statusText,
          headers: { 'content-type': 'application/json' },
        })
      },
    },
  },
})
