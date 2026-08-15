import { createFileRoute, redirect } from '@tanstack/react-router'

// N2-5: /bildirimler/$disclosureId → /kap-bildirimleri/$disclosureId; eski linkler redirect ile çalışır.
export const Route = createFileRoute('/bildirimler/$disclosureId')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/kap-bildirimleri/$disclosureId',
      params: { disclosureId: params.disclosureId },
    })
  },
})