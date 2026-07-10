import { createFileRoute } from '@tanstack/react-router'
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import type { CompanyStats, FundamentalDetail } from '../constants/companyShared'
import { Skeleton } from '../components/ui/skeleton'
import { useCompanyData } from '../lib/useCompanyData'

export const Route = createFileRoute('/hisse/$ticker/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data: companyRaw, isLoading: loading } = useCompanyData(tickerUpper)

  const stats: CompanyStats | null = companyRaw?.stats || null
  const fundamentalDetail: FundamentalDetail | null = companyRaw?.fundamentalDetail || null

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    )
  }

  const formatVolume = (vol: number | string) => {
    if (typeof vol === 'string') return vol
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
    return vol.toLocaleString('tr-TR')
  }

  const formatCurrency = (value: number) => {
    return `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'En Yüksek', value: formatCurrency(stats.high), icon: <TrendingUp size={14} /> },
            { label: 'En Düşük', value: formatCurrency(stats.low), icon: <TrendingDown size={14} /> },
            { label: 'Açılış', value: formatCurrency(stats.open), icon: <BarChart3 size={14} /> },
            { label: 'Hacim (₺)', value: formatVolume(fundamentalDetail?.volume || (typeof stats.volume === 'number' ? stats.volume : 0)), icon: <Activity size={14} /> },
          ].map((item) => (
            <div key={item.label} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
              </div>
              <span className="text-base font-bold text-foreground font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
