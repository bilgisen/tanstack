import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export const Route = createFileRoute('/panel/')({
  component: PanelIndexPage,
})

type IndexData = {
  id: string;
  title: string;
  code: string;
  value: string;
  absChange: string;
  pctChange: string;
  up: boolean;
};

const Sparkline = ({ up }: { up: boolean }) => {
  const color = up ? "oklch(0.65 0.13 145)" : "oklch(0.5248 0.1368 20.8317)" 
  const pathData = up 
    ? "M 0 20 Q 5 15, 10 18 T 20 10 T 30 15 T 40 5 T 50 12 T 60 2"
    : "M 0 5 Q 5 10, 10 8 T 20 15 T 30 12 T 40 22 T 50 18 T 60 25"

  return (
    <svg className="w-full h-10 mt-1" viewBox="0 0 60 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${up ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 60 30 L 0 30 Z`}
        fill={`url(#gradient-${up ? 'up' : 'down'})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PanelIndexPage() {
  const [indices, setIndices] = useState<IndexData[]>([
    { id: "bist30", title: "BIST 30", code: "XU030", value: "11.245,50", absChange: "+124,20", pctChange: "+1,20%", up: true },
    { id: "bist100", title: "BIST 100", code: "XU100", value: "10.245,50", absChange: "+112,50", pctChange: "+1,10%", up: true },
    { id: "bistbanka", title: "BIST Banka", code: "XBANK", value: "14.320,10", absChange: "-45,30", pctChange: "-0,30%", up: false },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndexData() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
        const res = await fetch(`${apiUrl}/api/market/summary`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
          const updated = indices.map(index => {
            const apiItem = json.data.find((item: any) => item.code.toUpperCase() === index.code);
            if (apiItem) {
              const last_price = apiItem.last_price || 0;
              const diff_percent = apiItem.diff_percent || 0;
              const up = diff_percent >= 0;
              const absChange = (last_price * (diff_percent / 100)).toFixed(2);
              
              return {
                ...index,
                value: last_price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                absChange: `${up ? "+" : ""}${Number(absChange).toLocaleString("tr-TR")}`,
                pctChange: `${up ? "+" : ""}${diff_percent.toFixed(2)}%`,
                up,
              };
            }
            return index;
          });
          setIndices(updated);
        }
      } catch (err) {
        console.error("Failed to load real-time index summary", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIndexData();
    // Poll index data every 30 seconds
    const interval = setInterval(fetchIndexData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      
      {/* Upper Section: Welcome Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Üye Paneli</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">BIST verilerini yapay zeka entegrasyonuyla takip edin</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center bg-card border border-border px-3 py-1.5 rounded-full shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <Activity size={10} /> BIST Canlı Veri Akışı
          </span>
        </div>
      </div>

      {/* Index Cards (BIST 30, BIST 100, BIST Banka) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {indices.map((ind) => (
          <Link
            key={ind.id}
            to={`/panel/endeksler/${ind.id}` as any}
            className="bg-card hover:bg-muted/40 border border-border transition-all rounded-2xl p-4 flex flex-col justify-between shadow-xs cursor-pointer group h-32 relative overflow-hidden active:scale-[0.99]"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{ind.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  ind.up ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                }`}>
                  {ind.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {ind.pctChange}
                </span>
              </div>
              
              <div className="mt-auto">
                <span className="text-xl font-black text-foreground tracking-tight block leading-none mb-1 group-hover:text-primary transition-colors">
                  {ind.value}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground block">
                  Değişim: {ind.absChange}
                </span>
              </div>
            </div>
            
            {/* Background mini sparkline graph */}
            <div className="absolute bottom-0 left-0 right-0 h-14 opacity-60 group-hover:opacity-100 transition-opacity">
              <Sparkline up={ind.up} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
