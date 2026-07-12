import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Info, Activity } from 'lucide-react'
import { useMemo } from 'react'
import { Skeleton } from '../components/ui/skeleton'
import { getIndexName } from '../constants/bistIndices'
import { useIndices, useIndexDetail } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id')({
  component: EndeksLayout,
})

const TABS = [
  { suffix: '', label: 'Genel Bakış', icon: Info },
  { suffix: '/teknik-analiz', label: 'Teknik Analiz', icon: Activity },
]

const indexMetadataFallbacks: Record<string, any> = {
  xu030: { name: "BIST 30", price: 11250.40, diffPercent: 1.45 },
  xu100: { name: "BIST 100", price: 10240.20, diffPercent: 1.15 },
  xu500: { name: "BIST 500", price: 12540.80, diffPercent: 0.95 },
  xbank: { name: "BIST Banka", price: 14520.10, diffPercent: -2.15 },
}

function EndeksLayout() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData, isLoading: indicesLoading } = useIndices()
  const { data: indexDetail, isLoading: detailLoading } = useIndexDetail(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find((item: any) => item.code?.toUpperCase() === code)
    const fallback = indexMetadataFallbacks[id.toLowerCase()]
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? fallback?.price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? fallback?.diffPercent ?? 0,
    }
  }, [indicesData, code, id])

  const isUp = priceDetails.diffPercent >= 0
  const basePath = `/endeksler/${id.toLowerCase()}`
  const loading = indicesLoading || detailLoading

  if (loading || !priceDetails) {
    return (
      <div className="space-y-5 pb-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-400">
      {/* Heading */}
      <div className="space-y-2 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logos/bist.svg" alt="BIST" className="h-7 w-7 md:h-8 md:w-8 object-contain" />
            <span className="text-xs md:text-sm text-muted-foreground font-mono font-semibold">{code}</span>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{priceDetails.name}</h1>
          </div>
          {indexDetail?.updateDate && (
            <span className="text-sm md:text-base font-light text-muted-foreground shrink-0">
              {indexDetail.updateDate.match(/(\d{2}):(\d{2})/)?.[0] || ''}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2.5 md:gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
            {priceDetails.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xl md:text-2xl font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
            {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
          </span>
        </div>

        {indexDetail && (
          <div className="flex items-center gap-4 md:gap-5 text-base md:text-lg text-muted-foreground">
            <span>En Düşük {indexDetail.low?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</span>
            <span>En Yüksek {indexDetail.high?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</span>
            <span>Hacim {(indexDetail.volume / 1_000_000_000)?.toFixed(2)}B</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <nav className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const to = tab.suffix === '' ? basePath : `${basePath}${tab.suffix}`
          return (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: tab.suffix === '' }}
              activeProps={{ className: 'bg-primary text-primary-foreground border border-primary shadow-sm' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/60 bg-transparent' }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
            >
              <tab.icon size={14} />
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Child route content */}
      <Outlet />
    </div>
  )
}
