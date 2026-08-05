import { createFileRoute } from '@tanstack/react-router'
import { LazyTradingViewChart } from '../components/charts/LazyTradingViewChart'
import { AiTechnicalReport } from '../components/chat/AiTechnicalReport'
import { useCompanyData } from '../lib/useCompanyData'

export const Route = createFileRoute('/hisse/$ticker/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function TechnicalAnalysisPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()

  const { data: companyRaw, isLoading: companyLoading } = useCompanyData(tickerUpper)

  const stats = companyRaw?.stats || null
  const taData = companyRaw?.taData || null

  if (companyLoading) {
    return (
      <div className="space-y-5">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const hasData = !!taData

  return (
    <div className="space-y-5">
      <LazyTradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {hasData ? (
        <AiTechnicalReport ticker={tickerUpper} context={`sirket:${tickerUpper}:teknik-analiz`} />
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-base">Bu hisse için teknik veri bulunamadı.</p>
        </div>
      )}
    </div>
  )
}