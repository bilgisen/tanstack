import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { fetchCompanyData, ScoreGauge, SignalBadge, type CompanyStats, type TaData } from '../constants/companyShared'
import {
  Activity, TrendingUp, BarChart3, Target, AlertTriangle,
  Shield, Gauge, LineChart,
} from 'lucide-react'

export const Route = createFileRoute('/sektorler/$slug/$company/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function TechnicalAnalysisPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [taData, setTaData] = useState<TaData>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchCompanyData(tickerUpper, slug).then((data: any) => {
      if (isMounted) {
        setStats(data.stats)
        setTaData(data.taData)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Chart — no card wrapper */}
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {/* TA Summary — seamless, no outer card */}
      {taData && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity size={14} className="text-emerald-500" />
              <h3 className="text-base font-semibold text-foreground">Teknik Analiz</h3>
            </div>
            <ScoreGauge score={taData.score} />
          </div>

          {/* Trend Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Günlük Trend', value: taData.trend, icon: <TrendingUp size={13} />, bull: taData.trend.toLowerCase().includes('bull') || taData.trend.toLowerCase().includes('yükseliş') },
              { label: 'ADX Trend Gücü', value: taData.market_regime.adx.toString(), icon: <LineChart size={13} />, bull: taData.market_regime.adx >= 25 ? true : null },
              { label: 'Piyasa Rejimi', value: taData.market_regime.regime, icon: <Gauge size={13} />, bull: null },
              { label: 'Güven Seviyesi', value: taData.confidence, icon: <Shield size={13} />, bull: null },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                </div>
                <span className={`text-base font-medium ${item.bull === true ? 'text-emerald-500' : item.bull === false ? 'text-destructive' : 'text-foreground'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Detailed Indicators — no card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="divide-y divide-border/15">
              {[
                { label: 'RSI (14)', value: `${taData.rsi.value.toFixed(1)} — ${taData.rsi.status}`, icon: <BarChart3 size={12} /> },
                { label: 'MACD', value: taData.macd, icon: <Activity size={12} /> },
                { label: 'Bollinger', value: taData.bollinger_status, icon: <Target size={12} /> },
                { label: 'SMA 20', value: `₺${taData.sma.sma_20.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'SMA 50', value: `₺${taData.sma.sma_50.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'SMA 200', value: `₺${taData.sma.sma_200.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'Destek', value: `₺${taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                { label: 'Direnç', value: `₺${taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <AlertTriangle size={12} /> },
                { label: 'Stop-Loss (ATR)', value: `₺${taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                { label: 'Risk/Ödül', value: taData.rr_ratio.toFixed(2) },
                { label: 'Beta', value: taData.beta.toFixed(2) },
                { label: 'ADX', value: taData.market_regime.adx.toFixed(1) },
                { label: 'Piyasa Genişliği', value: `${taData.market_breadth.breadth.toFixed(1)}% — ${taData.market_breadth.status}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    {row.icon}
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground font-mono">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Skor Bileşenleri</span>
                {[
                  { label: 'Trend', value: taData.score_components.trend, max: 50, color: 'bg-emerald-500' },
                  { label: 'Momentum', value: taData.score_components.momentum, max: 30, color: 'bg-blue-500' },
                  { label: 'Hacim', value: taData.score_components.volume, max: 20, color: 'bg-primary' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">{bar.label}</span>
                      <span className="text-foreground font-semibold">{bar.value}/{bar.max}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Uyumsuzluklar</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'RSI Yükseliş', active: taData.divergences.rsi.bullish, color: 'text-emerald-500' },
                    { label: 'RSI Düşüş', active: taData.divergences.rsi.bearish, color: 'text-destructive' },
                    { label: 'MACD Yükseliş', active: taData.divergences.macd.bullish, color: 'text-emerald-500' },
                    { label: 'MACD Düşüş', active: taData.divergences.macd.bearish, color: 'text-destructive' },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${d.active ? d.color : 'bg-muted/40'}`} />
                      <span className={`${d.active ? d.color : 'text-muted-foreground'} font-medium`}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {taData.signals.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Aktif Sinyaller</span>
              <div className="flex flex-wrap gap-1.5">
                {taData.signals.map((s: any, i: any) => (
                  <SignalBadge key={i} signal={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI CEO Report */}
      <CeoTaReport ticker={tickerUpper} />

    </div>
  )
}
