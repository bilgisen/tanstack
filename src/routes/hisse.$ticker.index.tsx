import { createFileRoute } from '@tanstack/react-router'
import { Activity, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
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
      <div className="space-y-4">
        <div className="border border-border/40 rounded-2xl bg-card/15 p-4 md:p-5">
          <Skeleton className="w-full aspect-video rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
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
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {fundamentalDetail && stats && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Değişim Oranları</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Haftalık',
                value: fundamentalDetail.weekClose > 0
                  ? ((stats.price - fundamentalDetail.weekClose) / fundamentalDetail.weekClose) * 100
                  : null,
              },
              {
                label: 'Aylık',
                value: fundamentalDetail.monthClose > 0
                  ? ((stats.price - fundamentalDetail.monthClose) / fundamentalDetail.monthClose) * 100
                  : null,
              },
              {
                label: 'Yıllık',
                value: fundamentalDetail.yearClose > 0
                  ? ((stats.price - fundamentalDetail.yearClose) / fundamentalDetail.yearClose) * 100
                  : null,
              },
            ].map((item) => {
              const isUp = (item.value ?? 0) >= 0
              return (
                <div key={item.label} className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1.5">{item.label}</span>
                  {item.value != null ? (
                    <span className={`text-lg font-bold font-mono ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                      {isUp ? '+' : ''}{item.value.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-lg font-bold font-mono text-muted-foreground">-</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Hacim</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatVolume(fundamentalDetail.volume)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Adet</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatVolume(fundamentalDetail.quantity)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Piyasa Değeri</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatVolume(fundamentalDetail.equity)}</span>
            </div>
          </div>
        </div>
      )}

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
