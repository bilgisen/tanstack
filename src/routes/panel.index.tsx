import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

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

function PanelIndexPage() {
  const [indices, setIndices] = useState<IndexData[]>([
    { id: "bist30", title: "BIST 30", code: "XU030", value: "11.245,50", absChange: "+124,20", pctChange: "+1,20%", up: true },
    { id: "bist100", title: "BIST 100", code: "XU100", value: "10.245,50", absChange: "+112,50", pctChange: "+1,10%", up: true },
    { id: "bist500", title: "BIST 500", code: "XU500", value: "12.808,40", absChange: "+182,50", pctChange: "+1,45%", up: true },
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
    <div className="space-y-4 animate-in fade-in duration-500 flex flex-col h-full">
      {/* 📈 Index Cards Container (Horizontal Snap-Scroll on Mobile, Grid on Desktop) */}
      <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-3 w-full pb-3 scrollbar-hide md:grid md:grid-cols-4 md:gap-4 md:overflow-x-visible md:pb-0">
        {indices.map((ind) => (
          <Link
            key={ind.id}
            to={`/panel/endeksler/${ind.id}` as any}
            className="bg-card hover:bg-muted/30 border border-border/60 hover:border-border transition-all rounded-xl p-4 flex flex-col justify-between shadow-2xs cursor-pointer group relative active:scale-[0.99] snap-align-start shrink-0 w-[75vw] md:w-full md:shrink-0 md:snap-align-none select-none"
          >
            <div className="flex flex-col h-full justify-between w-full">
              {/* Top Row: Symbol + Pct Change */}
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-foreground text-xs md:text-sm font-bold tracking-tight uppercase group-hover:text-primary transition-colors">
                  {ind.title}
                </span>
                <span className={`text-[10px] md:text-xs font-extrabold font-mono ${
                  ind.up ? "text-emerald-500" : "text-destructive"
                }`}>
                  {ind.pctChange}
                </span>
              </div>
              
              {/* Bottom Row: Large Value + Mini Circular Arrow Badge */}
              <div className="flex items-end justify-between mt-5 w-full">
                <span className="text-base md:text-lg font-black text-foreground tracking-tight block leading-none font-mono">
                  ₺{ind.value}
                </span>
                
                {/* Micro Circular Icon Badge */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-3xs shrink-0 select-none ${
                  ind.up 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20" 
                    : "bg-destructive/10 text-destructive border border-destructive/20 group-hover:bg-destructive/20"
                } transition-colors`}>
                  {ind.up ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
