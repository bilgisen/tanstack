import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { ScoreGauge, SignalBadge, type CompanyStats, type TaData, type FundamentalDetail } from '../constants/companyShared'
import { useCompanyData } from '../lib/useCompanyData'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import {
  Activity, TrendingUp, BarChart3, Target, AlertTriangle,
  Shield, Gauge, LineChart, Calendar,
} from 'lucide-react'

export const Route = createFileRoute('/hisse/$ticker/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function TechnicalAnalysisPage() {
  const { ticker } = Route.useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const tickerUpper = ticker.toUpperCase()
  const { data: companyRaw, isLoading: loading } = useCompanyData(tickerUpper)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/' })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !user) return null

  const stats: CompanyStats | null = companyRaw?.stats || null
  const taData: TaData = companyRaw?.taData || null
  const fundamentalDetail: FundamentalDetail | null = companyRaw?.fundamentalDetail || null

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
        </div>
      )}

      {taData && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity size={14} className="text-emerald-500" />
              <h3 className="text-base font-semibold text-foreground">Teknik Analiz</h3>
            </div>
            <ScoreGauge score={taData.score} />
          </div>

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

      <CeoTaReport ticker={tickerUpper} />
    </div>
  )
}
