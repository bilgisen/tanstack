import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { TrendingUp, Info, Sparkles, Gauge, Lock, ChevronRight } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { ScoreGauge } from '../constants/companyShared'
import { getIndexName } from '../constants/bistIndices'
import { useIndices } from '../lib/useMarketData'
import { useTAPublicSummary } from '../lib/useTechnicalAnalysis'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/endeksler/$id/teknik-analiz')({
  component: EndeksTechnicalAnalysisPage,
})



function LockedSection({
  tier,
  requiredTier,
  children,
}: {
  tier: string
  requiredTier: 'member' | 'subscriber'
  children: React.ReactNode
}) {
  const isLocked = tier === 'anonymous' && requiredTier === 'member' ||
    tier !== 'subscriber' && requiredTier === 'subscriber'

  if (!isLocked) return <>{children}</>

  const label = requiredTier === 'member' ? 'Üyelere Özel' : 'Abonelere Özel'
  const desc = requiredTier === 'member'
    ? 'Detaylı teknik göstergeler, sapma analizi ve sinyaller için üye olun.'
    : 'Yapay zeka destekli kapsamlı analiz raporu için abone olun.'
  const cta = requiredTier === 'member' ? 'Üye Ol' : 'Abone Ol'

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-30">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={16} className="text-primary" />
          </div>
          <h4 className="text-base font-bold text-foreground mb-1">{label}</h4>
          <p className="text-sm text-muted-foreground mb-4">{desc}</p>
          <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            {cta}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function EndeksTechnicalAnalysisPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()
  const { user } = useAuth()
  const userTier = !user ? 'anonymous' : (user.tier === 'pro' || user.tier === 'ultimate') ? 'subscriber' : 'member'

  const { data: indicesData } = useIndices()
  const { data: publicTa } = useTAPublicSummary(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find((item: any) => item.code?.toUpperCase() === code)
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? 0,
    }
  }, [indicesData, code])



  const publicData = publicTa as any

  return (
    <div className="space-y-5">
      <TradingViewChart symbol={code} lastPrice={priceDetails.price} />

      {/* Public Tier: Core Indicators */}
      {publicData && !publicData._blocked && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Teknik Görünüm</h3>
          </div>

          {publicData.score != null && (
            <div className="flex items-center gap-3">
              <ScoreGauge score={publicData.score} />
              <div>
                <div className="text-sm font-semibold text-foreground">{publicData.trend || 'Nötr'} trend</div>
                <div className="text-xs text-muted-foreground">{publicData.confidence || '—'} güven</div>
              </div>
            </div>
          )}

          {publicData.summary_text && (
            <p className="text-sm text-muted-foreground leading-relaxed">{publicData.summary_text}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', value: publicData.trend || 'Nötr', icon: <TrendingUp size={14} />, bull: (publicData.trend || '').toLowerCase().includes('bull') },
              { label: 'RSI (14)', value: publicData.rsi != null ? publicData.rsi.toFixed(1) : '—', icon: <Info size={14} />, bull: null },
              { label: 'MACD', value: publicData.macd_status || 'Nötr', icon: <TrendingUp size={14} />, bull: publicData.macd_status === 'Bullish' ? true : publicData.macd_status === 'Bearish' ? false : null },
              { label: 'Rejim', value: publicData.regime || '—', icon: <Gauge size={14} />, bull: null },
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

      {/* Subscriber Tier: AI Report */}
      <LockedSection tier={userTier} requiredTier="subscriber">
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <Sparkles size={14} className="text-violet-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Abonelere Özel AI Analiz Raporu</h3>
          </div>
          <CeoTaReport ticker={code} unit="puan" />
        </div>
      </LockedSection>
    </div>
  )
}


