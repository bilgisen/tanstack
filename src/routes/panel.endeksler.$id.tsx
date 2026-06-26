import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TrendingUp, ArrowUpCircle, ArrowDownCircle, BarChart3, Loader2 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { Skeleton } from '../components/ui/skeleton'

export const Route = createFileRoute('/panel/endeksler/$id')({
  component: EndeksDetailPage,
})

type IndexMeta = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  description: string;
  components: { code: string; name: string; price: number; diff: number; volume: string }[];
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

function parseVolume(vol: string): number {
  const cleaned = vol.replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (vol.includes('B')) return num * 1_000_000_000;
  if (vol.includes('M')) return num * 1_000_000;
  if (vol.includes('K')) return num * 1_000;
  return num;
}

function EndeksDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const rawId = id.toLowerCase();
  const currentFallback = indexMetadataFallbacks[rawId] || indexMetadataFallbacks.bist100;

  const [priceDetails, setPriceDetails] = useState<IndexMeta | null>(null)
  const [techSinyaller, setTechnicalSinyaller] = useState<any | null>(null)
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
                volume: liveStock ? liveStock.volume || fallbackComp.volume : fallbackComp.volume,
              };
            });
          }
        }
      } catch (e) {
        console.error("Failed fetching live components list", e);
      }

      let indexRsi = "54.1 (Nötr)";
      let indexMacd = "Nötr";
      let indexBollinger = "Orta Bantta";
      let indexDestek = `${(liveVal * 0.96).toFixed(0)}`;
      let indexDirenc = `${(liveVal * 1.04).toFixed(0)}`;

      try {
        const taRes = await fetch(`${apiUrl}/api/market/symbol/${currentFallback.code}/ta/summary`);
        if (taRes.ok) {
          const tJson = await taRes.json();
          if (tJson && !tJson.error) {
            const formatRsiValue = (val: any) => {
              if (val === undefined || val === null) return "50.0";
              const num = typeof val === "number" ? val : parseFloat(val);
              return isNaN(num) ? "50.0" : num.toFixed(1);
            };
            const formatNumberValue = (val: any, decimals: number, fallback: string) => {
              if (val === undefined || val === null) return fallback;
              const num = typeof val === "number" ? val : parseFloat(val);
              return isNaN(num) ? fallback : num.toFixed(decimals);
            };
            indexRsi = `${formatRsiValue(tJson.rsi)} (${tJson.rsi_status || "Nötr"})`;
            indexMacd = tJson.macd_status || "Nötr";
            indexBollinger = tJson.bollinger_status || "Orta Bantta";
            indexDestek = tJson.support ? `${formatNumberValue(tJson.support, 0, (liveVal * 0.96).toFixed(0))}` : indexDestek;
            indexDirenc = tJson.resistance ? `${formatNumberValue(tJson.resistance, 0, (liveVal * 1.04).toFixed(0))}` : indexDirenc;
          }
        }
      } catch (_) {}

      if (!isMounted) return;

      setPriceDetails({
        name: currentFallback.name,
        code: currentFallback.code,
        price: liveVal,
        diffPercent: liveDf,
        description: currentFallback.description,
        components: apiComponents,
      });

      setTechnicalSinyaller({
        rsi: indexRsi,
        macd: indexMacd,
        bollinger: indexBollinger,
        destek: indexDestek,
        direnc: indexDirenc,
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

  const volumeLeaders = useMemo(() => {
    if (!priceDetails) return [];
    return [...priceDetails.components].sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume)).slice(0, 5);
  }, [priceDetails]);

  if (loading || !priceDetails) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-[350px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const isUp = priceDetails.diffPercent >= 0;

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
              {isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
              {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <TradingViewChart symbol={priceDetails.code} lastPrice={priceDetails.price} />

      {/* Yükselenler / Düşenler / Hacim Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Yükselenler */}
        <div className="border border-emerald-500/10 bg-card/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/25">
            <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowUpCircle size={13} className="text-emerald-500" />
              Yükselenler
            </h3>
          </div>
          <div className="divide-y divide-border/20">
            {topGainers.map((row) => (
              <div
                key={row.code}
                onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-emerald-500/5 cursor-pointer transition-colors group"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors font-mono">{row.code}</span>
                <span className="text-[11px] font-bold text-emerald-500 font-mono">+{row.diff.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Düşenler */}
        <div className="border border-destructive/10 bg-card/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/25">
            <div className="w-1.5 h-4 rounded-full bg-destructive" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowDownCircle size={13} className="text-destructive" />
              Düşenler
            </h3>
          </div>
          <div className="divide-y divide-border/20">
            {topLosers.map((row) => (
              <div
                key={row.code}
                onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-destructive/5 cursor-pointer transition-colors group"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-destructive transition-colors font-mono">{row.code}</span>
                <span className="text-[11px] font-bold text-destructive font-mono">{row.diff.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hacim */}
        <div className="border border-blue-500/10 bg-card/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/25">
            <div className="w-1.5 h-4 rounded-full bg-blue-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart3 size={13} className="text-blue-500" />
              Hacim
            </h3>
          </div>
          <div className="divide-y divide-border/20">
            {volumeLeaders.map((row) => (
              <div
                key={row.code}
                onClick={() => navigate({ to: `/panel/sirketler/${row.code.toLowerCase()}` })}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-500/5 cursor-pointer transition-colors group"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors font-mono">{row.code}</span>
                <span className="text-[11px] font-bold text-blue-500 font-mono">{row.volume}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teknik Sinyaller - 1 Column */}
      {techSinyaller && (
        <div className="border border-border/40 bg-card/20 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-border/25">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={12} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Sinyaller</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-muted/15 rounded-xl p-3 border border-border/25">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">RSI (14)</span>
              <span className="text-sm font-bold text-foreground">{techSinyaller.rsi}</span>
            </div>
            <div className="bg-muted/15 rounded-xl p-3 border border-border/25">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">MACD</span>
              <span className="text-sm font-bold text-foreground">{techSinyaller.macd}</span>
            </div>
            <div className="bg-muted/15 rounded-xl p-3 border border-border/25">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Bollinger</span>
              <span className="text-sm font-bold text-foreground">{techSinyaller.bollinger}</span>
            </div>
            <div className="bg-muted/15 rounded-xl p-3 border border-border/25">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Destek</span>
              <span className="text-sm font-bold text-emerald-500">{Number(techSinyaller.destek).toLocaleString("tr-TR")}</span>
            </div>
            <div className="bg-muted/15 rounded-xl p-3 border border-border/25">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Direnç</span>
              <span className="text-sm font-bold text-destructive">{Number(techSinyaller.direnc).toLocaleString("tr-TR")}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
