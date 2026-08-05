import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { LazyTradingViewChart } from '../components/charts/LazyTradingViewChart'
import { AiTechnicalReport } from '../components/chat/AiTechnicalReport'
import { getIndexName } from '../constants/bistIndices'
import { useIndexDetail, useIndices } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/teknik-analiz')({
  component: EndeksTechnicalAnalysisPage,
})

function EndeksTechnicalAnalysisPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData } = useIndices()
  const { data: indexDetail } = useIndexDetail(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find(item => item.code?.toUpperCase() === code)
    const price = liveIndex?.last_price ?? indexDetail?.last ?? 0
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price,
    }
  }, [indicesData, indexDetail, code])

  return (
    <div className="space-y-5">
      <LazyTradingViewChart symbol={code} lastPrice={priceDetails.price} />

      <AiTechnicalReport ticker={code} context={`endeks:${code}:teknik-analiz`} />
    </div>
  )
}