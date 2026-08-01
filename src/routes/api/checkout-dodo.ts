import { createFileRoute } from '@tanstack/react-router'
import { Checkout } from '@dodopayments/tanstack'

export const Route = createFileRoute('/api/checkout-dodo')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const handler = Checkout({
          bearerToken: process.env.DODO_PAYMENTS_API_KEY,
          returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
          environment: process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' | undefined,
          type: 'static',
        })
        const res = await handler(request)
        const data = await res.json() as { checkout_url?: string }
        if (data.checkout_url) return Response.redirect(data.checkout_url, 302)
        return new Response(JSON.stringify(data), {
          status: res.status,
          statusText: res.statusText,
          headers: { 'content-type': 'application/json' },
        })
      },
    },
  },
})
