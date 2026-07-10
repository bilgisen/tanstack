import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Info, AlertCircle, Sliders, Sparkles } from 'lucide-react'

import { useMemo } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { Skeleton } from '../components/ui/skeleton'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { getIndexName } from '../constants/bistIndices'
import { useIndices, useTASummary, useIndexDetail } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id')({
  component: EndeksDetailPage,
})

type IndexMeta = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  description: string;
  components: { code: string; name: string; price: number; diff: number; volume: number | string }[];
};

const indexMetadataFallbacks: Record<string, IndexMeta> = {
  xu030: {
    name: "BIST 30",
    code: "XU030",
    price: 11250.40,
    diffPercent: 1.45,
    description: "Borsa İstanbul'da işlem gören, işlem hacmi ve piyasa değeri en yüksek 30 şirketin ortak performansını gösterir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  xu100: {
    name: "BIST 100",
    code: "XU100",
    price: 10240.20,
    diffPercent: 1.15,
    description: "Borsa İstanbul'un ana endeksidir. Piyasa değeri ve işlem hacmi en yüksek 100 hissenin performansını temsil eder.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
      { code: "BIMAS", name: "Bim Mağazalar", price: 385.50, diff: -0.52, volume: "2.1M" },
    ]
  },
  xu500: {
    name: "BIST 500",
    code: "XU500",
    price: 12540.80,
    diffPercent: 0.95,
    description: "Borsa İstanbul'da işlem gören ve en geniş kapsamlı 500 şirketin ortak performansını ölçen endekstir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  xbank: {
    name: "BIST Banka",
    code: "XBANK",
    price: 14520.10,
    diffPercent: -2.15,
    description: "Borsa İstanbul'da işlem gören ve ana faaliyet alanı bankacılık olan tüm finans kurumlarının performansını ölçer.",
    components: [
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "GARAN", name: "Garanti BBVA", price: 82.50, diff: -0.25, volume: "7.4M" },
      { code: "ISCTR", name: "İş Bankası C", price: 15.20, diff: 1.15, volume: "28.1M" },
      { code: "HALKB", name: "Halkbank", price: 16.40, diff: -1.80, volume: "5.1M" },
      { code: "VAKBN", name: "Vakıfbank", price: 18.10, diff: -2.10, volume: "6.2M" },
    ]
  }
};


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

function EndeksDetailPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase();

  const { data: indicesData } = useIndices()
  const { data: taApiData } = useTASummary(code)
  const { data: indexDetail } = useIndexDetail(code)

  const priceDetails = useMemo<IndexMeta | null>(() => {
    const liveIndex = indicesData?.find((item: any) => item.code?.toUpperCase() === code)
    const fallback = indexMetadataFallbacks[id.toLowerCase()]
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price: liveIndex?.last_price ?? fallback?.price ?? 0,
      diffPercent: liveIndex?.diff_percent ?? fallback?.diffPercent ?? 0,
      description: liveIndex?.description || fallback?.description || '',
      components: [],
    }
  }, [indicesData, code, id])

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

  if (!priceDetails) {
    return (
      <div className="space-y-5 pb-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-[350px] w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const isUp = priceDetails.diffPercent >= 0;
  const taAvailable = taData !== null;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      
      {/* Heading */}
      <div className="space-y-2 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/logos/bist.svg"
              alt="BIST"
              className="h-7 w-7 md:h-8 md:w-8 object-contain"
            />
            <span className="text-xs md:text-sm text-muted-foreground font-mono font-semibold">{priceDetails.code}</span>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{priceDetails.name}</h1>
          </div>
          {indexDetail?.updateDate && (
            <span className="text-sm md:text-base font-light text-muted-foreground shrink-0">
              {indexDetail.updateDate.match(/(\d{2}):(\d{2})/)?.[0] || ''}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2.5 md:gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
            {priceDetails.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xl md:text-2xl font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
            {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
          </span>
        </div>

        {indexDetail && (
          <div className="flex items-center gap-4 md:gap-5 text-base md:text-lg text-muted-foreground">
            <span>En Düşük {indexDetail.low.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span>En Yüksek {indexDetail.high.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span>Hacim {(indexDetail.volume / 1_000_000_000).toFixed(2)}B</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <TradingViewChart symbol={priceDetails.code} lastPrice={priceDetails.price} />

      {indexDetail && (
        <div className="flex items-baseline gap-3 md:gap-4 flex-wrap text-base md:text-lg text-muted-foreground pb-3 border-b border-border/30">
          Haftalık: <span className={(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>{(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0) >= 0 ? '+' : ''}{(indexDetail.weekClose ? ((indexDetail.last - indexDetail.weekClose) / indexDetail.weekClose) * 100 : 0).toFixed(2)}%</span>
          {'  '}Ay: <span className={(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>{(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0) >= 0 ? '+' : ''}{(indexDetail.monthClose ? ((indexDetail.last - indexDetail.monthClose) / indexDetail.monthClose) * 100 : 0).toFixed(2)}%</span>
          {'  '}Yıl: <span className={(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}>{(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0) >= 0 ? '+' : ''}{(indexDetail.yearClose ? ((indexDetail.last - indexDetail.yearClose) / indexDetail.yearClose) * 100 : 0).toFixed(2)}%</span>
        </div>
      )}

      {/* Teknik Sinyaller */}
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

          {/* Trend & ADX */}
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

          {/* Market Regime */}
          <div className="py-2.5 border-b border-border/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase">Piyasa Rejimi</span>
              <span className="text-sm md:text-base font-bold text-foreground">{taData.market_regime.regime}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Yön: </span>
                <span className="font-semibold text-foreground">{taData.market_regime.trend_direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Volatilite: </span>
                <span className="font-semibold text-foreground">{taData.market_regime.volatility_regime}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ADX: </span>
                <span className="font-semibold text-foreground">{taData.market_regime.adx}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Beta: </span>
                <span className="font-semibold text-foreground">{taData.beta}</span>
              </div>
            </div>
            {taData.market_regime.recommended_strategy && (
              <p className="text-xs text-muted-foreground italic leading-relaxed mt-1.5 pt-1.5 border-t border-border/20">
                {taData.market_regime.recommended_strategy}
              </p>
            )}
          </div>

          {/* RSI Gauge */}
          <div className="py-2.5 border-b border-border/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase">RSI Göstergesi</span>
              <span className={`text-sm font-bold ${
                taData.rsi.value > 70 ? "text-destructive" : taData.rsi.value < 30 ? "text-teal-600" : "text-foreground"
              }`}>
                {taData.rsi.value} ({taData.rsi.status})
              </span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/40 via-muted to-destructive/40" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-card border-2 border-border" 
                style={{ left: `${Math.min(Math.max(taData.rsi.value, 0), 100)}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30 (Aşırı Satım)</span>
              <span>50 (Nötr)</span>
              <span>70 (Aşırı Alım)</span>
            </div>
          </div>

          {/* MACD */}
          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-0.5">MACD (12, 26, 9)</span>
            <span className="text-sm md:text-base font-semibold text-foreground">{taData.macd}</span>
          </div>

          {/* SMA Lines */}
          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-2">Hareketli Ortalamalar</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "SMA 20", value: taData.sma.sma_20 },
                { label: "SMA 50", value: taData.sma.sma_50 },
                { label: "SMA 200", value: taData.sma.sma_200 },
              ].map((sma) => {
                const above = priceDetails.price > sma.value;
                return (
                  <div key={sma.label}>
                    <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block">{sma.label}</span>
                    <span className={`text-sm md:text-base font-bold font-mono ${above ? 'text-teal-600' : 'text-destructive'}`}>
                      {sma.value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support & Resistance */}
          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-2">Destek / Direnç Seviyeleri</span>
            <div className="relative h-1.5 w-full rounded-full bg-muted mb-1.5">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border-2 border-border"
                style={{ 
                  left: `${((priceDetails.price - taData.support_resistance.support) / 
                  (taData.support_resistance.resistance - taData.support_resistance.support || 1)) * 100}%`, 
                  transform: "translate(-50%, -50%)" 
                }}
              />
            </div>
            <div className="flex justify-between text-sm font-mono font-semibold">
              <div className="text-destructive">
                <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block">Destek</span>
                <span>{taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-teal-600 text-right">
                <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block">Direnç</span>
                <span>{taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bollinger Status */}
          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-0.5">Bollinger Bands Konumu</span>
            <span className="text-sm md:text-base font-semibold text-foreground">{taData.bollinger_status}</span>
          </div>

          {/* Stop-Loss & Risk/Reward */}
          <div className="grid grid-cols-2 gap-4 py-1">
            <div>
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-0.5">
                <AlertCircle size={12} className="text-destructive" /> Stop-Loss (1.5x ATR)
              </span>
              <span className="text-lg md:text-xl font-bold text-destructive font-mono block">
                {taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-muted-foreground">Puan</span>
            </div>
            <div>
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-0.5">
                <TrendingUp size={12} className="text-teal-600" /> Risk/Ödül
              </span>
              <span className="text-lg md:text-xl font-bold text-teal-600 font-mono block">
                {taData.rr_ratio.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">Oran</span>
            </div>
          </div>

          {/* Market Breadth */}
          <div className="flex justify-between items-center py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase">Piyasa Genişliği</span>
            <span className="text-sm md:text-base font-bold text-foreground">{taData.market_breadth.breadth.toFixed(1)}% — {taData.market_breadth.status}</span>
          </div>

          {/* Score Components */}
          <div className="py-2.5 border-b border-border/10">
            <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-2">Skor Bileşenleri</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Trend", value: taData.score_components.trend, color: taData.score_components.trend >= 0 ? "text-teal-600" : "text-destructive" },
                { label: "Momentum", value: taData.score_components.momentum, color: taData.score_components.momentum >= 0 ? "text-teal-600" : "text-destructive" },
                { label: "Hacim", value: taData.score_components.volume, color: taData.score_components.volume >= 0 ? "text-teal-600" : "text-destructive" },
              ].map((c) => (
                <div key={c.label}>
                  <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block">{c.label}</span>
                  <span className={`text-sm md:text-base font-bold font-mono ${c.color}`}>{c.value > 0 ? '+' : ''}{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signals */}
          {taData.signals.length > 0 && (
            <div className="py-2.5 border-b border-border/10">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-1.5">Aktif Sinyaller</span>
              <div className="space-y-1">
                {taData.signals.map((signal, i) => (
                  <div key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divergences */}
          {(taData.divergences.rsi.bullish || taData.divergences.rsi.bearish || taData.divergences.macd.bullish || taData.divergences.macd.bearish) && (
            <div className="py-2.5 border-b border-border/10">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-1.5">Sapma Analizi</span>
              <div className="flex flex-wrap gap-2">
                {taData.divergences.rsi.bullish && <span className="text-xs font-semibold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded">RSI: Bullish Divergence ↑</span>}
                {taData.divergences.rsi.bearish && <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">RSI: Bearish Divergence ↓</span>}
                {taData.divergences.macd.bullish && <span className="text-xs font-semibold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded">MACD: Bullish Divergence ↑</span>}
                {taData.divergences.macd.bearish && <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">MACD: Bearish Divergence ↓</span>}
              </div>
            </div>
          )}

          {/* Candlestick Patterns */}
          {taData.candlestick_patterns.length > 0 && (
            <div className="py-2.5 border-b border-border/10">
              <span className="text-xs md:text-sm text-muted-foreground font-semibold uppercase block mb-1.5">Son Mum Formasyonları</span>
              <div className="flex flex-wrap gap-1.5">
                {taData.candlestick_patterns.map((pattern, i) => (
                  <span key={i} className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LLM Summary */}
          {taData.llm_summary_prompt && (
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase block mb-1">AI Yorumu</span>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{taData.llm_summary_prompt}</p>
            </div>
          )}
        </div>
      )}

      {/* Pro AI Teknik Analiz Raporu */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Sparkles size={14} className="text-violet-500" />
          <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">Pro AI Teknik Analiz Raporu</h3>
        </div>
        <CeoTaReport ticker={priceDetails.code} unit="puan" />
      </div>



    </div>
  )
}
