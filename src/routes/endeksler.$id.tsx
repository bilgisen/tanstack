import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, BarChart3, Info, AlertCircle, Sliders } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { Skeleton } from '../components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
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

function parseVolume(vol: unknown): number {
  if (typeof vol === 'number') return vol;
  if (typeof vol !== 'string') return 0;
  const cleaned = vol.replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (vol.includes('B')) return num * 1_000_000_000;
  if (vol.includes('M')) return num * 1_000_000;
  if (vol.includes('K')) return num * 1_000;
  return num;
}

type TaData = {
  trend: string;
  adx_strength: string;
  rsi: { value: number; status: string };
  macd: string;
  bollinger_status: string;
  support_resistance: { support: number; resistance: number };
  atr_stop_loss: number;
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
              adx_strength: tJson.adx_strength || "Veri yok",
              rsi: rsiData,
              macd: tJson.macd || tJson.macd_status || "Nötr",
              bollinger_status: tJson.bollinger_status || "Orta Bantta",
              support_resistance: { support, resistance },
              atr_stop_loss: tJson.atr_stop_loss || tJson.stop_loss || (liveVal * 0.03),
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

  const topVolume = useMemo(() => {
    if (!priceDetails) return [];
    return [...priceDetails.components].sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume)).slice(0, 5);
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

      {/* Yükselenler / Düşenler / Hacim Tabs */}
      <Tabs defaultValue="gainers">
        <TabsList className="mb-1">
          <TabsTrigger value="gainers" className="gap-1.5">
            <ArrowUpCircle size={14} className="text-emerald-500" />
            <span>Yükselenler</span>
          </TabsTrigger>
          <TabsTrigger value="losers" className="gap-1.5">
            <ArrowDownCircle size={14} className="text-destructive" />
            <span>Düşenler</span>
          </TabsTrigger>
          <TabsTrigger value="volume" className="gap-1.5">
            <BarChart3 size={14} className="text-primary" />
            <span>Hacim</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gainers">
          <div className="divide-y divide-white/5">
            {topGainers.map((row) => {
              const logoFile = companyLogos[row.code as keyof typeof companyLogos];
              return (
                <div
                  key={row.code}
                  onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                  className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {logoFile ? (
                      <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        <img src={`/logos/${logoFile}`} alt={row.code} className="h-full w-full object-cover p-0.5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-[10px] shrink-0 border border-emerald-500/10">
                        {row.code.slice(0, 2)}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {row.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-bold font-mono text-emerald-500">
                      +{row.diff.toFixed(2).replace('.', ',')}%
                    </span>
                    <span className="text-base font-semibold font-mono text-foreground">
                      ₺{row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="losers">
          <div className="divide-y divide-white/5">
            {topLosers.map((row) => {
              const logoFile = companyLogos[row.code as keyof typeof companyLogos];
              return (
                <div
                  key={row.code}
                  onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                  className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {logoFile ? (
                      <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        <img src={`/logos/${logoFile}`} alt={row.code} className="h-full w-full object-cover p-0.5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-[10px] shrink-0 border border-destructive/10">
                        {row.code.slice(0, 2)}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {row.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-bold font-mono text-destructive">
                      {row.diff.toFixed(2).replace('.', ',')}%
                    </span>
                    <span className="text-base font-semibold font-mono text-foreground">
                      ₺{row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="volume">
          <div className="divide-y divide-white/5">
            {topVolume.map((row) => {
              const logoFile = companyLogos[row.code as keyof typeof companyLogos];
              const volNum = parseVolume(row.volume);
              return (
                <div
                  key={row.code}
                  onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                  className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {logoFile ? (
                      <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        <img src={`/logos/${logoFile}`} alt={row.code} className="h-full w-full object-cover p-0.5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0 border border-primary/10">
                        {row.code.slice(0, 2)}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {row.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-bold font-mono text-primary">
                      {volNum >= 1_000_000 ? `${(volNum / 1_000_000).toFixed(1)}M` : volNum >= 1_000 ? `${(volNum / 1_000).toFixed(1)}K` : volNum.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-base font-semibold font-mono text-foreground">
                      ₺{row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Teknik Sinyaller - Rich TA Data */}
      {taAvailable && taData && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-border/25">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sliders size={12} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Sinyaller</h3>
          </div>

          {/* Trend & ADX */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">Piyasa Trendi</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                taData.trend.includes("Bullish") 
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                  : taData.trend.includes("Bearish") 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {taData.trend.includes("Bullish") ? <TrendingUp size={14} /> : taData.trend.includes("Bearish") ? <TrendingDown size={14} /> : <Info size={14} />}
                {taData.trend}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">ADX Sinyal Gücü</span>
              <span className="text-xs font-semibold text-foreground/80">{taData.adx_strength}</span>
            </div>
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

          {/* Support & Resistance */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] text-muted-foreground font-bold uppercase">Destek / Direnç Seviyeleri</span>
              <span className="text-[11px] text-muted-foreground/80 font-mono">BB (20, 2)</span>
            </div>
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
                <span className="text-[9px] text-muted-foreground font-bold uppercase">Destek (BBL)</span>
                <span>{taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex flex-col items-end">
                <span className="text-[9px] text-muted-foreground font-bold uppercase text-right">Direnç (BBU)</span>
                <span>{taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bollinger Status */}
          <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-1">
            <span className="text-[11px] text-muted-foreground font-bold uppercase block">Bollinger Bands Konumu</span>
            <span className="text-xs font-semibold text-foreground/85">{taData.bollinger_status}</span>
          </div>

          {/* ATR Stop Loss */}
          <div className="bg-destructive/5 p-4 border border-destructive/20 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-destructive font-extrabold uppercase flex items-center gap-1.5">
                <AlertCircle size={12} /> Bilimsel Stop-Loss (1.5x ATR)
              </span>
              <p className="text-[10px] text-muted-foreground">ATR göstergesi temel alınarak hesaplanan koruyucu limit.</p>
            </div>
            <span className="text-lg font-bold text-destructive font-mono whitespace-nowrap">
              {taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY
            </span>
          </div>

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
              <p className="text-xs text-foreground/80 leading-relaxed">{taData.llm_summary_prompt}</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
