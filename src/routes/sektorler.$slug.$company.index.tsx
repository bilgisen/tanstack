import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Activity, Compass, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { fetchCompanyData, type CompanyStats, type TaData, type FundamentalData } from '../constants/companyShared'

export const Route = createFileRoute('/sektorler/$slug/$company/')({
  component: CompanyOverviewPage,
})

function CompanyOverviewPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [taData, setTaData] = useState<TaData>(null)
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchCompanyData(tickerUpper, slug).then((data: any) => {
      if (isMounted) {
        setStats(data.stats)
        setTaData(data.taData)
        setFundamental(data.fundamental)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Chart */}
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'En Yüksek', value: `₺${stats.high.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={14} /> },
            { label: 'En Düşük', value: `₺${stats.low.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <TrendingDown size={14} /> },
            { label: 'Açılış', value: `₺${stats.open.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <BarChart3 size={14} /> },
            { label: 'Hacim', value: stats.volume, icon: <Activity size={14} /> },
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
              { label: 'Destek/Direnç', value: `₺${taData.support_resistance.support.toFixed(2)} / ₺${taData.support_resistance.resistance.toFixed(2)}` },
            ].map((item) => (
              <div key={item.label} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
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
        </div>
      )}
    </div>
  )
}
