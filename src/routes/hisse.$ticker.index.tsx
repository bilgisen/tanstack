import { createFileRoute } from '@tanstack/react-router'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { useCompanyProfile } from '../lib/useCompanyData'
import { CompanyProfileCard } from '../components/company/CompanyProfileCard'
import { OwnershipStructure } from '../components/company/OwnershipStructure'
import { useCompanyQuote } from '../lib/useCompanyData'

export const Route = createFileRoute('/hisse/$ticker/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data: profile, isLoading } = useCompanyProfile(ticker)
  const { data: quote } = useCompanyQuote(tickerUpper)

  return (
    <div className="space-y-6">
      <TradingViewChart symbol={tickerUpper} lastPrice={quote?.last_price || 0} />
      <CompanyProfileCard profile={profile} loading={isLoading} />
      <OwnershipStructure shareholders={profile?.shareholders} loading={isLoading} />
    </div>
  )
}
