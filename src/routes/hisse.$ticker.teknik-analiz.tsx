import { createFileRoute } from '@tanstack/react-router'
import {
  Activity, AlertTriangle, BarChart3, Gauge,
  Shield, TrendingUp
} from 'lucide-react'
import { LazyTradingViewChart } from '../components/charts/LazyTradingViewChart'
import { AiTechnicalReport } from '../components/chat/AiTechnicalReport'
import { ScoreGauge } from '../constants/companyShared'
import { useCompanyData } from '../lib/useCompanyData'

export const Route = createFileRoute('/hisse/$ticker/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function TechnicalAnalysisPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()

  const { data: companyRaw, isLoading: companyLoading } = useCompanyData(tickerUpper)

  const stats = companyRaw?.stats || null
  const taData = companyRaw?.taData || null
  const fundamentalDetail = companyRaw?.fundamentalDetail || null

  const weekChange = fundamentalDetail && stats?.price && fundamentalDetail.weekClose > 0
    ? ((stats.price - fundamentalDetail.weekClose) / fundamentalDetail.weekClose) * 100 : null
  const monthChange = fundamentalDetail && stats?.price && fundamentalDetail.monthClose > 0
    ? ((stats.price - fundamentalDetail.monthClose) / fundamentalDetail.monthClose) * 100 : null
  const yearChange = fundamentalDetail && stats?.price && fundamentalDetail.yearClose > 0
    ? ((stats.price - fundamentalDetail.yearClose) / fundamentalDetail.yearClose) * 100 : null
  const fmtPct = (v: number | null) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '-'

  if (companyLoading) {
    return (
      <div className="space-y-5">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const hasData = !!taData

  return (
    <div className="space-y-5">
      <LazyTradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {fundamentalDetail && stats && (
        <div className="text-base text-muted-foreground">
          Hafta: <span className={`font-semibold ${(weekChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(weekChange)}</span>
          {' · '}Ay: <span className={`font-semibold ${(monthChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(monthChange)}</span>
          {' · '}Yıl: <span className={`font-semibold ${(yearChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(yearChange)}</span>
        </div>
      )}

      {hasData && (
        <div className="space-y-5">
          <AiTechnicalReport ticker={tickerUpper} context={`sirket:${tickerUpper}:teknik-analiz`} />

          <div className="space-y-5">
            <h3 className="text-base font-semibold text-foreground">Teknik Görünüm</h3>

            {taData.score != null && (
            <div className="flex items-center gap-3">
              <ScoreGauge score={taData.score} />
              <div>
                <div className="text-sm font-semibold text-foreground">{taData.trend || 'Nötr'} trend</div>
                <div className="text-xs text-muted-foreground">{taData.confidence || '—'} güven</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', value: taData.trend || 'Nötr', icon: <TrendingUp size={14} />, bull: (taData.trend || '').toLowerCase().includes('bull') },
              { label: 'RSI (14)', value: taData.rsi?.value != null ? taData.rsi.value.toFixed(1) : '—', icon: <BarChart3 size={14} />, bull: null },
              { label: 'MACD', value: taData.macd || 'Nötr', icon: <Activity size={14} />, bull: taData.macd === 'Bullish' ? true : taData.macd === 'Bearish' ? false : null },
              { label: 'Rejim', value: taData.market_regime?.regime || '—', icon: <Gauge size={14} />, bull: null },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-base font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className={`text-base font-medium ${item.bull === true ? 'text-emerald-500' : item.bull === false ? 'text-destructive' : 'text-foreground'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="divide-y divide-border/15">
            {taData.sma && [
              { label: 'SMA 20', value: taData.sma.sma_20 ? `₺${taData.sma.sma_20.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'SMA 50', value: taData.sma.sma_50 ? `₺${taData.sma.sma_50.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'SMA 200', value: taData.sma.sma_200 ? `₺${taData.sma.sma_200.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
            ].filter(r => r.value !== '—').map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5">
                <span className="text-base font-medium text-muted-foreground">{row.label}</span>
                <span className="text-base font-semibold text-foreground font-mono">{row.value}</span>
              </div>
            ))}
            {[
              { label: 'Destek', value: taData.support_resistance?.support ? `₺${taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : null },
              { label: 'Direnç', value: taData.support_resistance?.resistance ? `₺${taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : null },
            ].filter(r => r.value != null).map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5">
                <span className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                  {row.label === 'Destek' ? <Shield size={14} /> : <AlertTriangle size={14} />}
                  {row.label}
                </span>
                <span className="text-base font-semibold text-foreground font-mono">{row.value}</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {!hasData && !companyLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-base">Bu hisse için teknik veri bulunamadı.</p>
        </div>
      )}
    </div>
  )
}


