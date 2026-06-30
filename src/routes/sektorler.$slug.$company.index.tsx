import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Activity, Compass, TrendingUp, TrendingDown, BarChart3, Calendar, Clock, DollarSign } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { fetchCompanyData, type CompanyStats, type TaData, type FundamentalData, type FundamentalDetail } from '../constants/companyShared'
import { Skeleton } from '../components/ui/skeleton'

export const Route = createFileRoute('/sektorler/$slug/$company/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [taData, setTaData] = useState<TaData>(null)
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [fundamentalDetail, setFundamentalDetail] = useState<FundamentalDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchCompanyData(tickerUpper, slug).then((data: any) => {
      if (isMounted) {
        setStats(data.stats)
        setTaData(data.taData)
        setFundamental(data.fundamental)
        setFundamentalDetail(data.fundamentalDetail)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Chart skeleton */}
        <div className="border border-border/40 rounded-2xl bg-card/15 p-4 md:p-5">
          <Skeleton className="w-full aspect-video rounded-xl" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
        {/* TA Summary skeleton */}
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        {/* Fundamental summary skeleton */}
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
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
      {/* Chart */}
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'En Yüksek', value: formatCurrency(stats.high), icon: <TrendingUp size={14} /> },
            { label: 'En Düşük', value: formatCurrency(stats.low), icon: <TrendingDown size={14} /> },
            { label: 'Açılış', value: formatCurrency(stats.open), icon: <BarChart3 size={14} /> },
            { label: 'Hacim', value: formatVolume(fundamentalDetail?.volume || stats.volume), icon: <Activity size={14} /> },
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

      {/* Weekly & Yearly Data */}
      {fundamentalDetail && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Haftalık & Yıllık Veriler</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Haftalık */}
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Haftalık Düşük</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.weekLow)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Haftalık Yüksek</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.weekHigh)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Haftalık Kapanış</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.weekClose)}</span>
            </div>
            
            {/* Aylık */}
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Aylık Düşük</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.monthLow)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Aylık Yüksek</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.monthHigh)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Aylık Kapanış</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.monthClose)}</span>
            </div>
            
            {/* Yıllık */}
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Bu Yıl Kapanış</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.yearClose)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Geçen Yıl Kapanış</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.prevYearClose)}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Fiyat Adımı</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(fundamentalDetail.priceStep || 0.01)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TA Quick Summary */}
      {taData && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Teknik Analiz Özeti</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', value: taData.trend },
              { label: 'Skor', value: `${taData.score}/100` },
              { label: 'RSI', value: `${taData.rsi.value.toFixed(1)} — ${taData.rsi.status}` },
              { label: 'Destek/Direnç', value: `${formatCurrency(taData.support_resistance.support)} / ${formatCurrency(taData.support_resistance.resistance)}` },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <Link to={`${basePath}/teknik-analiz`} className="inline-flex items-center gap-2 px-4 py-2 border border-border/40 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/60 transition-all">
            <Activity size={14} />
            Detaylı Teknik Analiz
          </Link>
        </div>
      )}

      {/* Fundamental Quick Summary */}
      {fundamental && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Compass size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Temel Analiz Özeti</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'F/K', value: fundamental.fk },
              { label: 'ROE', value: fundamental.roe },
              { label: 'Cari Oran', value: fundamental.currentRatio },
              { label: 'Borç/Özsermaye', value: fundamental.debtToEquity },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                <span className="text-xs text-muted-foreground font-semibold uppercase block mb-1">{item.label}</span>
                <span className="text-base font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <Link to={`${basePath}/temel-analiz`} className="inline-flex items-center gap-2 px-4 py-2 border border-border/40 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/60 transition-all">
            <Compass size={14} />
            Detaylı Temel Analiz
          </Link>
        </div>
      )}
    </div>
  )
}
