import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hisse/$ticker/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  return <div />
}
