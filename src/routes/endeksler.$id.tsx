import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Info, AlertCircle, Sliders } from 'lucide-react'
import tickerToSectorSlug from '../constants/tickerToSectorSlug'

const TriangleUp = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12,4 22,20 2,20" />
  </svg>
)

import { useState, useEffect, useMemo } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { Skeleton } from '../components/ui/skeleton'
import companyLogos from '../constants/companyLogos.json'

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
  bist30: {
    name: "BIST 30 Endeksi",
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
  bist100: {
    name: "BIST 100 Endeksi",
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
  bist500: {
    name: "BIST 500 Endeksi",
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
  bistbanka: {
    name: "BIST Bankacılık",
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
  const navigate = useNavigate()
  const rawId = id.toLowerCase();
  const currentFallback = indexMetadataFallbacks[rawId] || indexMetadataFallbacks.bist100;

  const [priceDetails, setPriceDetails] = useState<IndexMeta | null>(null)
  const [taData, setTaData] = useState<TaData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadIndexData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      
      let liveVal = currentFallback.price;
      let liveDf = currentFallback.diffPercent;
      let apiComponents = [...currentFallback.components];

      try {
        const res = await fetch(`${apiUrl}/api/market/summary`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const apiItem = json.data.find((item: any) => item.code.toUpperCase() === currentFallback.code);
            if (apiItem) {
              liveVal = apiItem.last_price || liveVal;
              liveDf = apiItem.diff_percent !== undefined ? apiItem.diff_percent : liveDf;
            }
          }
        }
      } catch (e) {
        console.error("Failed loading live index value", e);
      }

      try {
        const resList = await fetch(`${apiUrl}/api/market/stocks`);
        if (resList.ok) {
          const listJson = await resList.json();
          if (listJson.data && Array.isArray(listJson.data)) {
            apiComponents = currentFallback.components.map((fallbackComp) => {
              const liveStock = listJson.data.find((item: any) => item.code.toUpperCase() === fallbackComp.code);
              return {
                code: fallbackComp.code,
                name: fallbackComp.name,
                price: liveStock ? liveStock.last_price : fallbackComp.price,
                diff: liveStock ? liveStock.diff_percent : fallbackComp.diff,
                volume: liveStock ? (liveStock.volume ?? fallbackComp.volume) : fallbackComp.volume,
              };
            });
          }
        }
      } catch (e) {
        console.error("Failed fetching live components list", e);
      }

      try {
        const taRes = await fetch(`${apiUrl}/api/market/symbol/${currentFallback.code}/ta/summary`);
        if (taRes.ok) {
          const tJson = await taRes.json();
          if (tJson && !tJson.error) {
            const formatRsi = (val: any): { value: number; status: string } => {
              const num = typeof val === "number" ? val : parseFloat(val);
              const rsiVal = isNaN(num) ? 50 : num;
              const rsiStatus = tJson.rsi_status || "Nötr";
              return { value: rsiVal, status: rsiStatus };
            };

            // Handle both API formats (rich borsa format vs simplified)
            const rsiData = tJson.rsi && typeof tJson.rsi === 'object' && 'value' in tJson.rsi
              ? tJson.rsi
              : formatRsi(tJson.rsi);

            const support = tJson.support_resistance?.support ?? tJson.support ?? (liveVal * 0.96);
            const resistance = tJson.support_resistance?.resistance ?? tJson.resistance ?? (liveVal * 1.04);

            setTaData({
              trend: tJson.trend || "Nötr",
              score: tJson.score ?? 50,
              confidence: tJson.confidence || "Veri yok",
              rsi: rsiData,
              macd: tJson.macd || tJson.macd_status || "Nötr",
              bollinger_status: tJson.bollinger_status || "Orta Bantta",
              sma: {
                sma_20: tJson.sma?.sma_20 || liveVal,
                sma_50: tJson.sma?.sma_50 || liveVal,
                sma_200: tJson.sma?.sma_200 || liveVal,
              },
              support_resistance: { support, resistance },
              atr_stop_loss: tJson.atr_stop_loss || tJson.stop_loss || (liveVal * 0.03),
              rr_ratio: tJson.rr_ratio || 0,
              beta: tJson.beta ?? 1,
              market_breadth: {
                breadth: tJson.market_breadth?.breadth ?? 50,
                status: tJson.market_breadth?.status || "Veri yok",
              },
              market_regime: {
                regime: tJson.market_regime?.regime || "Veri yok",
                trend_direction: tJson.market_regime?.trend_direction || "Veri yok",
                volatility_regime: tJson.market_regime?.volatility_regime || "Veri yok",
                adx: tJson.market_regime?.adx ?? 0,
                recommended_strategy: tJson.market_regime?.recommended_strategy || "",
              },
              signals: tJson.signals || [],
              divergences: {
                rsi: tJson.divergences?.rsi || { bullish: false, bearish: false },
                macd: tJson.divergences?.macd || { bullish: false, bearish: false },
              },
              score_components: {
                trend: tJson.score_components?.trend ?? 0,
                momentum: tJson.score_components?.momentum ?? 0,
                volume: tJson.score_components?.volume ?? 0,
              },
              candlestick_patterns: tJson.candlestick_patterns || [],
              llm_summary_prompt: tJson.llm_summary_prompt || "",
            });
          }
        }
      } catch (e) {
        console.error("Failed fetching TA data", e);
      }

      if (!isMounted) return;

      setPriceDetails({
        name: currentFallback.name,
        code: currentFallback.code,
        price: liveVal,
        diffPercent: liveDf,
        description: currentFallback.description,
        components: apiComponents,
      });

      setLoading(false);
    }

    loadIndexData();
    return () => { isMounted = false; };
  }, [id, currentFallback.code]);

  const topGainers = useMemo(() => {
    if (!priceDetails) return [];
    return [...priceDetails.components].sort((a, b) => b.diff - a.diff).slice(0, 5);
  }, [priceDetails]);

  const topLosers = useMemo(() => {
    if (!priceDetails) return [];
    return [...priceDetails.components].sort((a, b) => a.diff - b.diff).slice(0, 5);
  }, [priceDetails]);

  if (loading || !priceDetails) {
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
      
      {/* Heading Card */}
      <div className="border border-border/40 bg-card/30 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src="/logos/bist.svg"
            alt="BIST"
            className="h-11 w-11 rounded-xl object-contain bg-white p-1.5 border border-border/30 shadow-3xs shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">{priceDetails.code}</span>
            <h1 className="text-base md:text-xl font-bold text-foreground tracking-tight leading-tight truncate mt-0.5">{priceDetails.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight block leading-none">
              {priceDetails.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1.5 ${
              isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
            }`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <TradingViewChart symbol={priceDetails.code} lastPrice={priceDetails.price} />

      {/* Teknik Sinyaller - Rich TA Data */}
      {taAvailable && taData && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-border/25">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Sliders size={12} />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Sinyaller</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                taData.score >= 70 ? "bg-teal-500/10 text-teal-600" : taData.score >= 40 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"
              }`}>
                Skor: {taData.score}/100
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">{taData.confidence} Güven</span>
            </div>
          </div>

          {/* Trend & ADX */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">Günlük Trend</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                taData.trend.includes("Bullish") ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                : taData.trend.includes("Bearish") ? "bg-destructive/10 text-destructive" 
                : "bg-muted text-muted-foreground"
              }`}>
                {taData.trend.includes("Bullish") ? <TrendingUp size={14} /> : taData.trend.includes("Bearish") ? <TrendingDown size={14} /> : <Info size={14} />}
                {taData.trend}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">ADX Trend Gücü</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                taData.market_regime.adx >= 25 ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                : "bg-muted text-muted-foreground"
              }`}>
                {taData.market_regime.adx}
              </span>
            </div>
          </div>

          {/* Market Regime */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground font-bold uppercase">Piyasa Rejimi</span>
              <span className="text-xs font-extrabold text-foreground">{taData.market_regime.regime}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground font-semibold">Yön: </span>
                <span className="font-bold text-foreground">{taData.market_regime.trend_direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Volatilite: </span>
                <span className="font-bold text-foreground">{taData.market_regime.volatility_regime}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">ADX: </span>
                <span className="font-bold text-foreground">{taData.market_regime.adx}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Beta: </span>
                <span className="font-bold text-foreground">{taData.beta}</span>
              </div>
            </div>
            {taData.market_regime.recommended_strategy && (
              <p className="text-[10px] text-muted-foreground italic leading-relaxed pt-1 border-t border-border/30">
                {taData.market_regime.recommended_strategy}
              </p>
            )}
          </div>

          {/* RSI Gauge */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground font-bold uppercase">RSI Göstergesi</span>
              <span className={`text-xs font-extrabold ${
                taData.rsi.value > 70 ? "text-destructive" : taData.rsi.value < 30 ? "text-teal-600 dark:text-teal-400" : "text-foreground"
              }`}>
                {taData.rsi.value} ({taData.rsi.status})
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/40 via-muted to-destructive/40" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-card border-2 border-border shadow-sm transition-all duration-500" 
                style={{ left: `${Math.min(Math.max(taData.rsi.value, 0), 100)}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>30 (Aşırı Satım)</span>
              <span>50 (Nötr)</span>
              <span>70 (Aşırı Alım)</span>
            </div>
          </div>

          {/* MACD */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-1">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">MACD (12, 26, 9)</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
              <Sliders size={14} className="text-primary" />
              <span>{taData.macd}</span>
            </div>
          </div>

          {/* SMA Lines */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">Hareketli Ortalamalar</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "SMA 20", value: taData.sma.sma_20 },
                { label: "SMA 50", value: taData.sma.sma_50 },
                { label: "SMA 200", value: taData.sma.sma_200 },
              ].map((sma) => {
                const above = priceDetails.price > sma.value;
                return (
                  <div key={sma.label} className="text-center">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block">{sma.label}</span>
                    <span className={`text-[11px] font-bold font-mono ${above ? 'text-teal-600 dark:text-teal-400' : 'text-destructive'}`}>
                      {sma.value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support & Resistance */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2.5">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">Destek / Direnç Seviyeleri</span>
            <div className="relative h-2 w-full rounded-full bg-muted">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-border shadow-sm"
                style={{ 
                  left: `${((priceDetails.price - taData.support_resistance.support) / 
                  (taData.support_resistance.resistance - taData.support_resistance.support || 1)) * 100}%`, 
                  transform: "translate(-50%, -50%)" 
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono font-semibold">
              <div className="text-destructive flex flex-col">
                <span className="text-[9px] text-muted-foreground font-bold uppercase">Destek</span>
                <span>{taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex flex-col items-end">
                <span className="text-[9px] text-muted-foreground font-bold uppercase text-right">Direnç</span>
                <span>{taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bollinger Status */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-1">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">Bollinger Bands Konumu</span>
            <span className="text-xs font-semibold text-foreground/85">{taData.bollinger_status}</span>
          </div>

          {/* Stop-Loss & Risk/Reward */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-destructive/5 p-4 border border-destructive/20 rounded-xl">
              <span className="text-[10px] text-destructive font-extrabold uppercase flex items-center gap-1.5 mb-1">
                <AlertCircle size={11} /> Stop-Loss (1.5x ATR)
              </span>
              <span className="text-lg font-bold text-destructive font-mono block">
                {taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-[9px] text-muted-foreground">Puan</span>
            </div>
            <div className="bg-teal-500/5 p-4 border border-teal-500/20 rounded-xl">
              <span className="text-[10px] text-teal-600 font-extrabold uppercase flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} /> Risk/Ödül
              </span>
              <span className="text-lg font-bold text-teal-600 font-mono block">
                {taData.rr_ratio.toFixed(2)}
              </span>
              <span className="text-[9px] text-muted-foreground">Oran</span>
            </div>
          </div>

          {/* Market Breadth */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground font-bold uppercase">Piyasa Genişliği</span>
              <span className="text-xs font-bold text-foreground">{taData.market_breadth.breadth.toFixed(1)}% — {taData.market_breadth.status}</span>
            </div>
          </div>

          {/* Score Components */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">Skor Bileşenleri</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Trend", value: taData.score_components.trend, color: taData.score_components.trend >= 0 ? "text-teal-600" : "text-destructive" },
                { label: "Momentum", value: taData.score_components.momentum, color: taData.score_components.momentum >= 0 ? "text-teal-600" : "text-destructive" },
                { label: "Hacim", value: taData.score_components.volume, color: taData.score_components.volume >= 0 ? "text-teal-600" : "text-destructive" },
              ].map((c) => (
                <div key={c.label} className="text-center">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase block">{c.label}</span>
                  <span className={`text-sm font-extrabold font-mono ${c.color}`}>{c.value > 0 ? '+' : ''}{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signals */}
          {taData.signals.length > 0 && (
            <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block">Aktif Sinyaller</span>
              <div className="space-y-1.5">
                {taData.signals.map((signal, i) => (
                  <div key={i} className="text-[11px] text-foreground/80 font-medium flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divergences */}
          {(taData.divergences.rsi.bullish || taData.divergences.rsi.bearish || taData.divergences.macd.bullish || taData.divergences.macd.bearish) && (
            <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block">Sapma Analizi</span>
              <div className="grid grid-cols-2 gap-2">
                {taData.divergences.rsi.bullish && <span className="text-[10px] font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded">RSI: Bullish Divergence ↑</span>}
                {taData.divergences.rsi.bearish && <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">RSI: Bearish Divergence ↓</span>}
                {taData.divergences.macd.bullish && <span className="text-[10px] font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded">MACD: Bullish Divergence ↑</span>}
                {taData.divergences.macd.bearish && <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">MACD: Bearish Divergence ↓</span>}
              </div>
            </div>
          )}

          {/* Candlestick Patterns */}
          {taData.candlestick_patterns.length > 0 && (
            <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block">Son Mum Formasyonları</span>
              <div className="flex flex-wrap gap-1.5">
                {taData.candlestick_patterns.map((pattern, i) => (
                  <span key={i} className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LLM Summary */}
          {taData.llm_summary_prompt && (
            <div className="bg-muted/15 p-4 border border-border/40 rounded-xl">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-2">AI Yorumu</span>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{taData.llm_summary_prompt}</p>
            </div>
          )}
        </div>
      )}

      {/* Yükselenler / Düşenler */}
      <div className="border border-border/40 bg-card/20 rounded-2xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-border/25">
          <div className="w-6 h-6 rounded-lg bg-muted/30 flex items-center justify-center">
            <TriangleUp size={12} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Hisse Performansı</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Yükselenler</span>
            </div>
            <div className="divide-y divide-white/5 border border-border/30 rounded-xl overflow-hidden">
              {topGainers.map((row) => {
                const logoFile = companyLogos[row.code as keyof typeof companyLogos];
                return (
                  <div
                    key={row.code}
                    onClick={() => navigate({ to: `/sektorler/${tickerToSectorSlug[row.code] || 'diger'}/${row.code.toLowerCase()}` })}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {logoFile ? (
                        <div className="h-7 w-7 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                          <img src={`/logos/${logoFile}`} alt={row.code} className="h-full w-full object-cover p-0.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-[9px] shrink-0">{row.code.slice(0, 2)}</div>
                      )}
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{row.code}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-emerald-500">+{row.diff.toFixed(2).replace('.', ',')}%</span>
                      <span className="text-xs font-semibold font-mono text-foreground">₺{row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-3 rounded-full bg-destructive" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Düşenler</span>
            </div>
            <div className="divide-y divide-white/5 border border-border/30 rounded-xl overflow-hidden">
              {topLosers.map((row) => {
                const logoFile = companyLogos[row.code as keyof typeof companyLogos];
                return (
                  <div
                    key={row.code}
                    onClick={() => navigate({ to: `/sektorler/${tickerToSectorSlug[row.code] || 'diger'}/${row.code.toLowerCase()}` })}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {logoFile ? (
                        <div className="h-7 w-7 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                          <img src={`/logos/${logoFile}`} alt={row.code} className="h-full w-full object-cover p-0.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-[9px] shrink-0">{row.code.slice(0, 2)}</div>
                      )}
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{row.code}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-destructive">{row.diff.toFixed(2).replace('.', ',')}%</span>
                      <span className="text-xs font-semibold font-mono text-foreground">₺{row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
