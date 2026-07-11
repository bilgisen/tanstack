import { createFileRoute } from '@tanstack/react-router'
import { useCompanyProfile } from '../lib/useCompanyData'
import { CompanyProfileCard } from '../components/company/CompanyProfileCard'
import { OwnershipStructure } from '../components/company/OwnershipStructure'

export const Route = createFileRoute('/hisse/$ticker/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { ticker } = Route.useParams()
  const { data: profile, isLoading } = useCompanyProfile(ticker)

  return (
    <div className="space-y-6">
      <CompanyProfileCard profile={profile} loading={isLoading} />
      <OwnershipStructure shareholders={profile?.shareholders} loading={isLoading} />
    </div>
  )
}
