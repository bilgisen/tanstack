import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { TrendingUp, Info, Sparkles, Gauge } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { LockedSection } from '../components/company/LockedSection'
import { ScoreGauge } from '../constants/companyShared'
import { getIndexName } from '../constants/bistIndices'
import { useIndices } from '../lib/useMarketData'
import { useTAPublicSummary } from '../lib/useTechnicalAnalysis'

export const Route = createFileRoute('/endeksler/$id/teknik-analiz')({
  component: EndeksTechnicalAnalysisPage,
})


function EndeksTechnicalAnalysisPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData } = useIndices()
  const { data: publicTa } = useTAPublicSummary(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find(item => item.code?.toUpperCase() === code)
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? 0,
    }
  }, [indicesData, code])



  const hasData = !!publicTa && !publicTa._blocked
  const isBlocked = !!publicTa?._blocked

  return (
    <div className="space-y-5">
      <TradingViewChart symbol={code} lastPrice={priceDetails.price} />

      {/* Public Tier: Core Indicators */}
      {hasData && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Teknik Görünüm</h3>
          </div>

          {publicTa?.score != null && (
            <div className="flex items-center gap-3">
              <ScoreGauge score={publicTa.score} />
              <div>
                <div className="text-sm font-semibold text-foreground">{publicTa.trend || 'Nötr'} trend</div>
                <div className="text-xs text-muted-foreground">{publicTa.confidence || '—'} güven</div>
              </div>
            </div>
          )}

          {publicTa?.summary_text && (
            <p className="text-sm text-muted-foreground leading-relaxed">{publicTa.summary_text}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', value: publicTa?.trend || 'Nötr', icon: <TrendingUp size={14} />, bull: ((publicTa?.trend || '')).toLowerCase().includes('bull') },
              { label: 'RSI (14)', value: publicTa?.rsi != null ? publicTa.rsi.toFixed(1) : '—', icon: <Info size={14} />, bull: null },
              { label: 'MACD', value: publicTa?.macd_status || 'Nötr', icon: <TrendingUp size={14} />, bull: publicTa?.macd_status === 'Bullish' ? true : publicTa?.macd_status === 'Bearish' ? false : null },
              { label: 'Rejim', value: publicTa?.regime || '—', icon: <Gauge size={14} />, bull: null },
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
        </div>
      )}

      {/* No data fallback */}
      {!publicTa && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-base">Bu endeks için teknik veri bulunamadı.</p>
        </div>
      )}

      {/* Subscriber Tier: AI Report (only when base TA data exists) */}
      {(hasData || isBlocked) && (
        <LockedSection variant="subscriber">
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-border/30">
              <Sparkles size={14} className="text-violet-500" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Abonelere Özel AI Analiz Raporu</h3>
            </div>
            <CeoTaReport ticker={code} unit="puan" />
          </div>
        </LockedSection>
      )}
    </div>
  )
}


