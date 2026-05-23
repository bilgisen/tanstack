import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, TrendingUp, PanelLeft } from "lucide-react";
import { useUIStore } from "../../store/ui";

type SummaryItem = {
  code: string;
  display_name: string;
  last_price: number;
  diff_percent: number;
  volume?: number;
};

export function LeftSidebar() {
  const [tickers, setTickers] = useState<SummaryItem[]>([]);
  const { isLeftSidebarExpanded, toggleLeftSidebarExpanded } = useUIStore();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
        const res = await fetch(`${apiUrl}/api/market/summary`);
        if (!res.ok) throw new Error("Network error");
        const json = await res.json();
        if (json.data) setTickers(json.data);
      } catch (err) {
        console.error("Failed to load market summary", err);
      }
    }
    fetchSummary();
  }, []);

  const displayTickers = tickers.length > 0 ? tickers : [
    { code: "XU100", display_name: "BIST 100", last_price: 10245.5, diff_percent: 1.2, volume: 145000000 },
    { code: "USDTRY", display_name: "USD/TRY", last_price: 34.52, diff_percent: 0.12, volume: 0 },
    { code: "EURTRY", display_name: "EUR/TRY", last_price: 38.10, diff_percent: -0.05, volume: 0 },
    { code: "BTCUSD", display_name: "BTC/USD", last_price: 64500.0, diff_percent: 2.4, volume: 21000000 },
    { code: "XAUUSD", display_name: "Altın/USD", last_price: 2450.1, diff_percent: -0.3, volume: 0 },
    { code: "THYAO", display_name: "TÜRK HAVA YOLLARI", last_price: 312.50, diff_percent: 2.1, volume: 85000000 },
    { code: "TUPRS", display_name: "TÜPRAŞ", last_price: 185.40, diff_percent: -1.2, volume: 42000000 },
    { code: "EREGL", display_name: "EREĞLİ DEMİR ÇELİK", last_price: 48.12, diff_percent: -2.85, volume: 29000000 },
  ];

  const getRoute = (code: string) => {
    const isIndex = ["XU100", "XU030", "XBANK"].includes(code);
    if (isIndex) {
      const indexId = code === "XU100" ? "bist100" : code === "XU030" ? "bist30" : "bistbanka";
      return `/panel/endeksler/${indexId}`;
    }
    const isForexOrCrypto = ["USDTRY", "EURTRY", "BTCUSD", "XAUUSD"].includes(code);
    if (isForexOrCrypto) {
      return `/panel/borsa`; // Fallback to market overview
    }
    return `/panel/sirketler/${code.toLowerCase()}`;
  };

  return (
    <aside className={`
      hidden lg:flex flex-col border-r border-border bg-card text-card-foreground shrink-0 z-30 transition-all duration-300 relative h-full overflow-hidden
      ${isLeftSidebarExpanded ? "w-[280px]" : "w-0 border-r-0"}
    `}>
      {/* Header */}
      <div className={`h-14 flex items-center border-b border-border/80 sticky top-0 bg-card z-20 px-4 ${isLeftSidebarExpanded ? "justify-between" : "justify-center overflow-hidden"}`}>
        {isLeftSidebarExpanded && (
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2 animate-in fade-in duration-200">
            <TrendingUp size={14} className="text-primary" /> İzleme Listesi
          </h2>
        )}
        <button 
          onClick={toggleLeftSidebarExpanded}
          className={`w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer ${
            isLeftSidebarExpanded ? "relative" : "absolute -right-0.5 top-4.5 bg-card border border-border rounded-l-md shadow-2xs"
          }`}
          title={isLeftSidebarExpanded ? "Kapat" : "Aç"}
        >
          <PanelLeft size={14} className="text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displayTickers.map((t, idx) => {
          const isUp = (t.diff_percent ?? 0) >= 0;
          return (
            <Link
              key={idx}
              to={getRoute(t.code)}
              className={`flex items-center rounded-xl hover:bg-muted/50 transition-all group/item ${
                isLeftSidebarExpanded 
                  ? "p-3 justify-between" 
                  : "p-2.5 justify-center flex-col gap-1.5"
              }`}
            >
              {isLeftSidebarExpanded ? (
                // Expanded View
                <>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover/item:text-primary transition-colors truncate">
                      {t.display_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{t.code}</span>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-semibold text-xs text-foreground">{t.last_price?.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isUp ? "text-emerald-500" : "text-destructive"}`}>
                      {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {Math.abs(t.diff_percent ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                // Collapsed View
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] border transition-colors select-none ${
                    isUp 
                      ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 group-hover/item:bg-emerald-500/10" 
                      : "bg-destructive/5 text-destructive border-destructive/10 group-hover/item:bg-destructive/10"
                  }`}>
                    {t.code.slice(0, 3)}
                  </div>
                  <span className={`text-[9px] font-bold ${isUp ? "text-emerald-500" : "text-destructive"}`}>
                    {isUp ? "+" : ""}{t.diff_percent?.toFixed(1)}%
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
