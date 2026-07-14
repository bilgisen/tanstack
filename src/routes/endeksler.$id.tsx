import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Info, Activity, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Clock } from 'lucide-react'
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
  xu050: { name: "BIST 50", price: 12540.80, diffPercent: 0.95 },
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
      {/* Heading — matches hisse ticker header design */}
      <div className="space-y-1 pb-4 border-b border-border/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logos/bist.svg" alt="BIST" className="h-9 w-9 rounded-sm object-contain bg-white shrink-0" />
            <div className="min-w-0 space-y-0.5">
              <span className="text-base text-muted-foreground font-light tracking-tight">{code}</span>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">{priceDetails.name}</h1>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight block leading-none tabular-nums">
              {priceDetails.price > 0
                ? priceDetails.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '-'}
            </span>
            <span className={`text-base md:text-lg font-bold inline-flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
              {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {indexDetail && (
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1 pt-2">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                Hacim: <span className="text-foreground/70 font-semibold">
                  {indexDetail.volume
                    ? (indexDetail.volume / 1_000_000_000).toFixed(2) + 'B'
                    : '-'}
                </span>
              </span>
              <span className="flex items-center gap-0.5 text-destructive/70">
                <ChevronDown size={12} />
                <span className="text-foreground/70 font-semibold">
                  {indexDetail.low?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                </span>
              </span>
              <span className="flex items-center gap-0.5 text-emerald-500/70">
                <ChevronUp size={12} />
                <span className="text-foreground/70 font-semibold">
                  {indexDetail.high?.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                </span>
              </span>
            </div>
            {indexDetail.updateDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <Clock size={14} />
                {(() => {
                  const m = indexDetail.updateDate.match(/(\d{2}):(\d{2})/)
                  return m ? m[0] : ''
                })()}
              </span>
            )}
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
