import { createFileRoute } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { useCompanyProfile } from '../lib/useCompanyData'
import { CompanyProfileCard } from '../components/company/CompanyProfileCard'
import { OwnershipStructure } from '../components/company/OwnershipStructure'

export const Route = createFileRoute('/hisse/$ticker/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data: profile, isLoading } = useCompanyProfile(ticker)

  if (!isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 size={40} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-sm font-bold text-foreground mb-1">Şirket Bulunamadı</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {tickerUpper} için profil verisi bulunamadı. Hisse kodu hatalı olabilir veya veriler henüz yüklenmemiş olabilir.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CompanyProfileCard profile={profile} loading={isLoading} />
      <OwnershipStructure shareholders={profile?.shareholders} loading={isLoading} />
    </div>
  )
}
