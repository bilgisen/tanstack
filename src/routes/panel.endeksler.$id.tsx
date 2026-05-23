import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Globe, BarChart3, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/panel/endeksler/$id')({
  component: EndeksDetailPage,
})

type IndexMeta = {
  name: string;
  code: string;
  description: string;
  fallbackValue: string;
  fallbackDiff: number;
  components: { code: string; name: string; price: number; diff: number; volume: string }[];
};

const indexMetadata: Record<string, IndexMeta> = {
  bist30: {
    name: "BIST 30 Endeksi",
    code: "XU030",
    description: "Borsa İstanbul'da işlem gören, işlem hacmi ve piyasa değeri en yüksek 30 şirketin ortak performansını gösterir.",
    fallbackValue: "11.245,50",
    fallbackDiff: 1.25,
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
    description: "Borsa İstanbul'un ana endeksidir. Piyasa değeri ve işlem hacmi en yüksek 100 hissenin ağırlıklı performansını temsil eder.",
    fallbackValue: "10.245,50",
    fallbackDiff: 1.10,
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
      { code: "BIMAS", name: "Bim Mağazalar", price: 385.50, diff: -0.52, volume: "2.1M" },
    ]
  },
  bistbanka: {
    name: "BIST Bankacılık Endeksi",
    code: "XBANK",
    description: "Borsa İstanbul'da işlem gören ve ana faaliyet alanı bankacılık olan tüm finans kurumlarının performansını ölçer.",
    fallbackValue: "14.320,10",
    fallbackDiff: -0.30,
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

function EndeksDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [indexData, setIndexData] = useState<IndexMeta | null>(null)
  const [liveValue, setLiveValue] = useState("")
  const [liveDiff, setLiveDiff] = useState(0)
  const [loading, setLoading] = useState(true)

  const rawId = id.toLowerCase();
  const currentMeta = indexMetadata[rawId] || indexMetadata.bist100;

  useEffect(() => {
    async function fetchIndexDetail() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
        const res = await fetch(`${apiUrl}/api/market/summary`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
          const apiItem = json.data.find((item: any) => item.code.toUpperCase() === currentMeta.code);
          if (apiItem) {
            setLiveValue(apiItem.last_price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            setLiveDiff(apiItem.diff_percent || 0);
          } else {
            setLiveValue(currentMeta.fallbackValue);
            setLiveDiff(currentMeta.fallbackDiff);
          }
        }
      } catch (err) {
        console.error("Failed to load live index point detail", err);
        setLiveValue(currentMeta.fallbackValue);
        setLiveDiff(currentMeta.fallbackDiff);
      } finally {
        setLoading(false);
      }
    }

    setIndexData(currentMeta);
    fetchIndexDetail();
  }, [id, currentMeta]);

  if (!indexData) return null;

  const isUp = liveDiff >= 0;

  // Custom premium SVG historical chart points (simulating 6 months history)
  const chartPoints = isUp 
    ? "M 10 90 Q 50 60, 100 75 T 150 40 T 200 55 T 250 20 T 300 45 T 350 15 T 400 5"
    : "M 10 20 Q 50 45, 100 30 T 150 60 T 200 50 T 250 85 T 300 70 T 350 90 T 400 95";

  const strokeColor = isUp ? "oklch(0.65 0.13 145)" : "oklch(0.5248 0.1368 20.8317)";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      {/* Go Back & Breadcrumb Header */}
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/panel" 
          className="w-9 h-9 bg-card border border-border hover:bg-muted text-foreground flex items-center justify-center rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Endeks Detay</span>
          <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-none">{indexData.name}</h1>
        </div>
      </div>

      {/* Main Info Grid & Historical SVG Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">
        
        {/* Index point and metadata cards */}
        <div className="lg:col-span-4 bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md uppercase tracking-wider">{indexData.code}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">Live Feed</span>
            </div>
            
            <div className="mt-6 space-y-1">
              <span className="text-muted-foreground text-xs font-bold">Endeks Değeri</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black tracking-tight text-foreground">{liveValue}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                }`}>
                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {liveDiff > 0 ? "+" : ""}{liveDiff.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-medium leading-relaxed border-t border-border/50 pt-4 mt-6">
            {indexData.description}
          </p>
        </div>

        {/* SVG Historical Chart Box */}
        <div className="lg:col-span-8 bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-xs min-h-[180px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={14} className="text-primary" /> 6 Aylık Grafik Geçmişi
            </span>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Spot / Günlük</span>
          </div>

          {/* Area Sparkline SVG */}
          <div className="w-full h-32 mt-4 relative">
            <svg className="w-full h-full" viewBox="0 0 410 105" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`detail-grad-${isUp ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${chartPoints} L 400 105 L 10 105 Z`}
                fill={`url(#detail-grad-${isUp ? 'up' : 'down'})`}
              />
              <path
                d={chartPoints}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground font-bold px-2 pt-2 border-t border-border/30">
            <span>Aralık 2025</span>
            <span>Şubat 2026</span>
            <span>Nisan 2026</span>
            <span>Canlı</span>
          </div>
        </div>

      </div>

      {/* Constituent Stocks Table Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1">
        
        {/* Table of Constituent Stocks */}
        <div className="xl:col-span-12 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col h-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider mb-4 shrink-0">
            <Globe size={14} className="text-primary" />
            <span>Endeks Bileşenleri ve Ağırlıkları</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 pr-2">Hisse</th>
                  <th className="pb-3 pr-2">Şirket Unvanı</th>
                  <th className="pb-3 text-right pr-2">Son Fiyat</th>
                  <th className="pb-3 text-right">Değişim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {indexData.components.map((comp) => {
                  const compUp = comp.diff >= 0;
                  return (
                    <tr 
                      key={comp.code}
                      onClick={() => navigate({ to: `/panel/sirketler/${comp.code.toLowerCase()}` as any })}
                      className="group hover:bg-muted/30 cursor-pointer transition-all"
                    >
                      <td className="py-3.5 pr-2">
                        <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors block leading-none">{comp.code}</span>
                      </td>
                      <td className="py-3.5 pr-2 max-w-[140px] truncate">
                        <span className="text-[11px] font-semibold text-muted-foreground truncate">{comp.name}</span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span className="text-xs font-bold text-foreground">{comp.price.toFixed(2)} TL</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                          compUp ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        }`}>
                          {compUp ? "+" : ""}{comp.diff.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}
