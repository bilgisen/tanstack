import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Info, Sliders } from 'lucide-react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { Skeleton } from '../components/ui/skeleton'
import { getIndexName } from '../constants/bistIndices'
import { useIndices, useTASummary, useIndexDetail } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/')({
  component: EndeksOverviewPage,
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

function EndeksOverviewPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData } = useIndices()
  const { data: taApiData } = useTASummary(code)
  const { data: indexDetail } = useIndexDetail(code)

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

  const taAvailable = taData !== null

  if (!priceDetails) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-[350px] w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <TradingViewChart symbol={code} lastPrice={priceDetails.price} />

      {indexDetail && (
        <div className="flex items-baseline gap-3 md:gap-4 flex-wrap text-base md:text-lg text-muted-foreground pb-3 border-b border-border/30">
          Haftalık: <span className={(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
            {(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? '+' : ''}
            {(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0).toFixed(2)}%
          </span>
          {'  '}Ay: <span className={(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
            {(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? '+' : ''}
            {(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0).toFixed(2)}%
          </span>
          {'  '}Yıl: <span className={(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>
            {(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? '+' : ''}
            {(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0).toFixed(2)}%
          </span>
        </div>
      )}

      {/* Public TA Snapshot */}
      {taAvailable && taData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-emerald-500" />
              <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">Teknik Sinyaller</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded-full ${
                taData.score >= 70 ? "bg-teal-500/10 text-teal-600" : taData.score >= 40 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"
              }`}>
                Skor: {taData.score}/100
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">{taData.confidence} Güven</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-border/10">
            <div>
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-0.5">Günlük Trend</span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                taData.trend.includes("Bullish") ? "text-teal-600"
                : taData.trend.includes("Bearish") ? "text-destructive"
                : "text-muted-foreground"
              }`}>
                {taData.trend.includes("Bullish") ? <TrendingUp size={14} /> : taData.trend.includes("Bearish") ? <TrendingDown size={14} /> : <Info size={14} />}
                {taData.trend}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-0.5">ADX Trend Gücü</span>
              <span className={`text-sm font-bold ${taData.market_regime.adx >= 25 ? "text-teal-600" : "text-muted-foreground"}`}>
                {taData.market_regime.adx}
              </span>
            </div>
          </div>

          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-2">Piyasa Genişliği</span>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">SMA 50 Üstündeki Hisse %</span>
              <span className={`text-base font-bold font-mono ${(taData.market_breadth.breadth ?? 50) >= 50 ? 'text-teal-600' : 'text-destructive'}`}>
                {taData.market_breadth.breadth.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{taData.market_breadth.status}</p>
          </div>

          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-2">Piyasa Rejimi</span>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div><span className="text-muted-foreground">Rejim: </span><span className="font-semibold">{taData.market_regime.regime}</span></div>
              <div><span className="text-muted-foreground">Yön: </span><span className={`font-semibold ${(taData.market_regime.trend_direction || '').toLowerCase().includes('bull') ? 'text-emerald-500' : 'text-destructive'}`}>{taData.market_regime.trend_direction}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
