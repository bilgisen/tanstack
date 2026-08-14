import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { SektorPieChart } from '../components/ui/sektor-pie-chart'
import { Skeleton } from '../components/ui/skeleton'
import { GROUP_TO_SINGLE_SECTOR, bistDonutToSectorName, groupKeyToSlug, sectorNameToGroupKey, sectorNameToSlug } from '../constants/sectorGroups'
import { getIndexName } from '../constants/bistIndices'
import { useIndices, useSektorDagilimi } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/')({
  component: EndeksOverviewPage,
})

function EndeksOverviewPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()
  const navigate = useNavigate()

  const { data: indicesData } = useIndices()
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

const handleSectorClick = (item: { name: string; value: number }) => {
    const sector = bistDonutToSectorName(item.name)
    if (!sector) {
      navigate({ to: '/sektorler' })
      return
    }
    const groupKey = sectorNameToGroupKey(sector)
    if (!groupKey) {
      navigate({ to: '/sektorler' })
      return
    }
    const groupSlug = groupKeyToSlug(groupKey)
    if (GROUP_TO_SINGLE_SECTOR[groupKey]) {
      navigate({ to: `/sektorler/${groupSlug}` })
      return
    }
    navigate({ to: `/sektorler/${groupSlug}/${sectorNameToSlug(sector)}` })
  }

  return (
    <div className="space-y-5">
      {sektorData && sektorData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">Sektör Dağılımı</h3>
          <div className="p-4 md:p-6 rounded-xl border border-border/30">
            <SektorPieChart data={sektorData.map(s => ({ nameTr: s.nameTr ?? '', value: s.value ?? 0 }))} onItemClick={handleSectorClick} />
          </div>
        </div>
      )}
    </div>
  )
}
