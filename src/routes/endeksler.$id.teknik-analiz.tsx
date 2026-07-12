import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { TrendingUp, Info, AlertCircle, Sparkles, Shield, Gauge, Lock, ChevronRight } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { ScoreGauge, SignalBadge } from '../constants/companyShared'
import { getIndexName } from '../constants/bistIndices'
import { useIndices, useTASummary } from '../lib/useMarketData'
import { useTAPublicSummary, useTAMemberSummary } from '../lib/useTechnicalAnalysis'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/endeksler/$id/teknik-analiz')({
  component: EndeksTechnicalAnalysisPage,
})

type TaData = {
  trend: string;
  score: number;
  confidence: string;
  rsi: { value: number; status: string };
  macd: string;
  bollinger_status: string;
  sma: { sma_20: number; sma_50: number; sma_200: number };
  support_resistance: { support: number; resistance: number };
  atr_stop_loss: number;
  rr_ratio: number;
  beta: number;
  market_breadth: { breadth: number; status: string };
  market_regime: { regime: string; trend_direction: string; volatility_regime: string; adx: number; recommended_strategy: string };
  signals: string[];
  divergences: { rsi: { bullish: boolean; bearish: boolean }; macd: { bullish: boolean; bearish: boolean } };
  score_components: { trend: number; momentum: number; volume: number };
  candlestick_patterns: string[];
  llm_summary_prompt: string;
} | null;

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
  const isMember = userTier === 'member' || userTier === 'subscriber'

  const { data: indicesData } = useIndices()
  const { data: taApiData } = useTASummary(code)
  const { data: publicTa } = useTAPublicSummary(code)
  useTAMemberSummary(code, isMember)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find((item: any) => item.code?.toUpperCase() === code)
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? 0,
    }
  }, [indicesData, code])

  const taData = useMemo<TaData | null>(() => {
    const tJson = taApiData
    if (!tJson || tJson.error) return null

    const formatRsi = (val: any): { value: number; status: string } => {
      const num = typeof val === "number" ? val : parseFloat(val)
      return { value: isNaN(num) ? 50 : num, status: tJson.rsi_status || "Nötr" }
    }
    const rsiData = tJson.rsi && typeof tJson.rsi === 'object' && 'value' in tJson.rsi
      ? tJson.rsi
      : formatRsi(tJson.rsi)
    const liveVal = priceDetails?.price || 10000

    return {
      trend: tJson.trend || "Nötr",
      score: tJson.score ?? 50,
      confidence: tJson.confidence || "Veri yok",
      rsi: rsiData,
      macd: tJson.macd || tJson.macd_status || "Nötr",
      bollinger_status: tJson.bollinger_status || "Orta Bantta",
      sma: { sma_20: tJson.sma?.sma_20 || liveVal, sma_50: tJson.sma?.sma_50 || liveVal, sma_200: tJson.sma?.sma_200 || liveVal },
      support_resistance: { support: tJson.support_resistance?.support ?? tJson.support ?? (liveVal * 0.96), resistance: tJson.support_resistance?.resistance ?? tJson.resistance ?? (liveVal * 1.04) },
      atr_stop_loss: tJson.atr_stop_loss || tJson.stop_loss || (liveVal * 0.03),
      rr_ratio: tJson.rr_ratio || 0,
      beta: tJson.beta ?? 1,
      market_breadth: { breadth: tJson.market_breadth?.breadth ?? 50, status: tJson.market_breadth?.status || "Veri yok" },
      market_regime: { regime: tJson.market_regime?.regime || "Veri yok", trend_direction: tJson.market_regime?.trend_direction || "Veri yok", volatility_regime: tJson.market_regime?.volatility_regime || "Veri yok", adx: tJson.market_regime?.adx ?? 0, recommended_strategy: tJson.market_regime?.recommended_strategy || "" },
      signals: tJson.signals || [],
      divergences: { rsi: tJson.divergences?.rsi || { bullish: false, bearish: false }, macd: tJson.divergences?.macd || { bullish: false, bearish: false } },
      score_components: { trend: tJson.score_components?.trend ?? 0, momentum: tJson.score_components?.momentum ?? 0, volume: tJson.score_components?.volume ?? 0 },
      candlestick_patterns: tJson.candlestick_patterns || [],
      llm_summary_prompt: tJson.llm_summary_prompt || "",
    }
  }, [taApiData, priceDetails])

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

      {/* Member Tier: Extended TA */}
      <LockedSection tier={userTier} requiredTier="member">
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <Shield size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Üyelere Özel Teknik Analiz</h3>
          </div>

          {taData && <EndeksMemberContent data={taData} />}
        </div>
      </LockedSection>

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

function EndeksMemberContent({ data }: { data: TaData }) {
  if (!data) return <p className="text-sm text-muted-foreground">Veri yüklenemedi.</p>

  const regime = data.market_regime || {}
  const divergences = data.divergences || {}
  const signals = data.signals || []
  const scoreComp = data.score_components || {}
  const breadth = data.market_breadth || {}

  return (
    <div className="space-y-4">
      {regime.regime && (
        <div className="bg-card/30 border border-border/20 rounded-xl p-4 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Piyasa Rejimi</span>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Rejim: </span><span className="font-semibold">{regime.regime}</span></div>
            <div><span className="text-muted-foreground">Yön: </span><span className={`font-semibold ${(regime.trend_direction || '').toLowerCase().includes('bull') ? 'text-emerald-500' : 'text-destructive'}`}>{regime.trend_direction || '—'}</span></div>
            <div><span className="text-muted-foreground">Volatilite: </span><span className="font-semibold">{regime.volatility_regime || '—'}</span></div>
            <div><span className="text-muted-foreground">ADX: </span><span className="font-semibold">{regime.adx ?? '—'}</span></div>
          </div>
          {regime.recommended_strategy && (
            <p className="text-xs text-muted-foreground italic mt-1 pt-2 border-t border-border/10">{regime.recommended_strategy}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {scoreComp.trend != null && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Skor Bileşenleri</span>
            {[
              { label: 'Trend', value: scoreComp.trend, max: 50, color: 'bg-emerald-500' },
              { label: 'Momentum', value: scoreComp.momentum, max: 30, color: 'bg-blue-500' },
              { label: 'Hacim', value: scoreComp.volume, max: 20, color: 'bg-primary' },
            ].filter(c => c.value != null).map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-muted-foreground font-medium">{bar.label}</span>
                  <span className="text-foreground font-semibold">{Math.round(bar.value)}/{bar.max}</span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {signals.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Aktif Sinyaller</span>
              <div className="flex flex-wrap gap-1.5">
                {signals.slice(0, 8).map((s, i) => (
                  <SignalBadge key={i} signal={s} />
                ))}
              </div>
            </div>
          )}

          {(divergences.rsi?.bullish || divergences.rsi?.bearish || divergences.macd?.bullish || divergences.macd?.bearish) && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Sapma Analizi</span>
              <div className="flex flex-wrap gap-2">
                {divergences.rsi?.bullish && <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">RSI: Bullish ↑</span>}
                {divergences.rsi?.bearish && <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">RSI: Bearish ↓</span>}
                {divergences.macd?.bullish && <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">MACD: Bullish ↑</span>}
                {divergences.macd?.bearish && <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">MACD: Bearish ↓</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-border/15">
        {data.bollinger_status !== '—' && (
          <div className="flex justify-between items-center py-2.5">
            <span className="text-base font-medium text-muted-foreground">Bollinger Bandı</span>
            <span className="text-base font-semibold text-foreground">{data.bollinger_status}</span>
          </div>
        )}
        {breadth.breadth != null && (
          <div className="flex justify-between items-center py-2.5">
            <span className="text-base font-medium text-muted-foreground">Piyasa Genişliği</span>
            <span className="text-base font-semibold text-foreground">{breadth.breadth.toFixed(1)}% — {breadth.status || '—'}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 py-2.5">
          <div>
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-0.5">
              <AlertCircle size={12} className="text-destructive" /> Stop-Loss (1.5x ATR)
            </span>
            <span className="text-lg md:text-xl font-bold text-destructive font-mono block">
              {data.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-muted-foreground">Puan</span>
          </div>
          <div>
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-0.5">
              <TrendingUp size={12} className="text-teal-600" /> Risk/Ödül
            </span>
            <span className="text-lg md:text-xl font-bold text-teal-600 font-mono block">
              {data.rr_ratio.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">Oran</span>
          </div>
        </div>
      </div>
    </div>
  )
}
