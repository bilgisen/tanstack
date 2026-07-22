import { createFileRoute } from '@tanstack/react-router'
import { Checkout } from '@polar-sh/tanstack-start'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      GET: Checkout({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        returnUrl: 'https://jetborsa.com/profil',
        server: (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production',
      }),
    },
  },
})
