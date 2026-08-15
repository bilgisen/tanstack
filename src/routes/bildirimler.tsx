import { createFileRoute, redirect } from '@tanstack/react-router'

// N2-5: /bildirimler → /kap-bildirimleri taşındı; eski linkler redirect ile çalışır.
export const Route = createFileRoute('/bildirimler')({
  beforeLoad: () => {
    throw redirect({ to: '/kap-bildirimleri' })
  },
})