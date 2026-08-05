import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SektorPieChart } from '../components/ui/sektor-pie-chart'
import { Skeleton } from '../components/ui/skeleton'
import { getIndexName } from '../constants/bistIndices'
import { useIndexDetail, useIndices, useSektorDagilimi } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/')({
  component: EndeksOverviewPage,
})

function EndeksOverviewPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData } = useIndices()
  const { data: indexDetail } = useIndexDetail(code)
  const { data: sektorData } = useSektorDagilimi(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find(item => item.code?.toUpperCase() === code)
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? 0,
    }
  }, [indicesData, code])

  if (!priceDetails) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-[350px] w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {indexDetail && (() => {
        const last = indexDetail.last ?? 0
        return (
          <div className="flex items-baseline gap-3 md:gap-4 flex-wrap text-base md:text-lg text-muted-foreground pb-3 border-b border-border/30">
            Haftalık: <span className={(indexDetail.weekClose ? ((last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
              {(indexDetail.weekClose ? ((last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? '+' : ''}
              {(indexDetail.weekClose ? ((last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0).toFixed(2)}%
            </span>
            {'  '}Ay: <span className={(indexDetail.monthClose ? ((last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
              {(indexDetail.monthClose ? ((last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? '+' : ''}
              {(indexDetail.monthClose ? ((last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0).toFixed(2)}%
            </span>
            {'  '}Yıl: <span className={(indexDetail.yearClose ? ((last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
              {(indexDetail.yearClose ? ((last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? '+' : ''}
              {(indexDetail.yearClose ? ((last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0).toFixed(2)}%
            </span>
          </div>
        )
      })()}

      {sektorData && sektorData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">Sektör Dağılımı</h3>
          <div className="p-4 md:p-6 rounded-xl border border-border/30">
            <SektorPieChart data={sektorData.map(s => ({ nameTr: s.nameTr ?? '', value: s.value ?? 0 }))} />
          </div>
        </div>
      )}
    </div>
  )
}
