import { createFileRoute } from '@tanstack/react-router'
import { Polar } from '@polar-sh/sdk'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const products = url.searchParams.getAll('products')
        if (!products.length) {
          return Response.json({ error: 'Missing products parameter' }, { status: 400 })
        }

        const accessToken = process.env.POLAR_ACCESS_TOKEN || 'polar_oat_OEuqQCRI8hRBYBV247e4e75I2VTDNkD6r05JV1S3YaF'
        const server = (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production'

        const polar = new Polar({
          accessToken,
          server,
        })

        try {
          const result = await polar.checkouts.create({
            products,
            externalCustomerId: url.searchParams.get('customerExternalId') || undefined,
            customerId: url.searchParams.get('customerId') || undefined,
            customerEmail: url.searchParams.get('customerEmail') || undefined,
            customerName: url.searchParams.get('customerName') || undefined,
            returnUrl: 'https://jetborsa.com/profil',
          })

          return Response.redirect(result.url, 302)
        } catch (error: any) {
          console.error('[Polar Checkout Error]:', error)
          return Response.json(
            {
              error: 'Failed to create checkout session',
              message: error?.message || String(error),
            },
            { status: 500 }
          )
        }
      },
    },
  },
})
