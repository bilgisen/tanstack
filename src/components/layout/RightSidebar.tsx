import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PanelRight } from "lucide-react";
import { useUIStore } from "../../store/ui";

type StockItem = {
  code: string;
  name: string;
  display_name?: string;
  last_price: number;
  diff_percent: number;
  volume?: number;
};

export function RightSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
        
        // Fetch Stocks
        const resStocks = await fetch(`${apiUrl}/api/market/stocks`);
        if (resStocks.ok) {
          const json = await resStocks.json();
          if (json.data && Array.isArray(json.data)) {
            setStocks(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load market data for side panel", err);
      } finally {
        setLoading(false);
      }
    }

    if (isRightSidebarOpen) {
      fetchMarketData();
      const interval = setInterval(fetchMarketData, 30000);
      return () => clearInterval(interval);
    }
  }, [isRightSidebarOpen]);

  // Robust fallback data if server is cold starting or API fails
  const fallbackStocks: StockItem[] = [
    { code: "THYAO", name: "TÜRK HAVA YOLLARI", last_price: 312.50, diff_percent: 4.82, volume: 85000000 },
    { code: "TUPRS", name: "TÜPRAŞ", last_price: 185.40, diff_percent: 3.12, volume: 42000000 },
    { code: "KCHOL", name: "KOÇ HOLDİNG", last_price: 242.10, diff_percent: 2.85, volume: 38000000 },
    { code: "AKBNK", name: "AKBANK", last_price: 58.40, diff_percent: -3.42, volume: 55000000 },
    { code: "EREGL", name: "EREĞLİ DEMİR ÇELİK", last_price: 48.12, diff_percent: -2.85, volume: 29000000 },
    { code: "YKBNK", name: "YAPI KREDİ BANKASI", last_price: 32.10, diff_percent: -4.15, volume: 48000000 },
    { code: "ASELS", name: "ASELSAN ELEKTRONİK", last_price: 64.20, diff_percent: 5.12, volume: 31000000 },
    { code: "SAHOL", name: "SABANCI HOLDİNG", last_price: 98.70, diff_percent: -1.25, volume: 21000000 },
    { code: "PGSUS", name: "PEGASUS HAVA YOLLARI", last_price: 985.00, diff_percent: 6.45, volume: 15000000 },
    { code: "BIMAS", name: "BİM BİRLEŞİK MAĞAZALAR", last_price: 385.50, diff_percent: -0.52, volume: 12000000 },
  ];

  const listStocks = stocks.length > 0 ? stocks : fallbackStocks;

  // Compute Gainers & Losers
  const gainers = [...listStocks]
    .filter((s) => s.diff_percent > 0)
    .sort((a, b) => b.diff_percent - a.diff_percent)
    .slice(0, 5);

  const losers = [...listStocks]
    .filter((s) => s.diff_percent < 0)
    .sort((a, b) => a.diff_percent - b.diff_percent)
    .slice(0, 5);

  const handleStockClick = (code: string) => {
    navigate({ to: `/panel/sirketler/${code.toLowerCase()}` as any });
  };

  return (
    <aside 
      className={`
        hidden lg:flex flex-col border-l border-border bg-card text-card-foreground shrink-0 z-30 transition-all duration-300 relative h-full overflow-hidden
        ${isRightSidebarOpen ? "w-[320px] xl:w-[350px]" : "w-0 border-none"}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border/80 sticky top-0 bg-card z-10">
        <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
          Bugün
        </h2>
        <button 
          onClick={toggleRightSidebar}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
          title="Paneli Kapat"
        >
          <PanelRight size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Top Gainers */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase tracking-wider">
            <TrendingUp size={14} />
            <span>En Çok Yükselenler</span>
          </div>
          <div className="space-y-1.5">
            {loading ? (
              <div className="h-24 bg-muted/30 rounded-xl animate-pulse" />
            ) : (
              gainers.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleStockClick(s.code)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                      {s.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[130px] xl:max-w-[160px]">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-foreground">
                      {s.last_price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ArrowUpRight size={10} />
                      {s.diff_percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="space-y-3 border-t border-border/40 pt-5">
          <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase tracking-wider">
            <TrendingDown size={14} />
            <span>En Çok Düşenler</span>
          </div>
          <div className="space-y-1.5">
            {loading ? (
              <div className="h-24 bg-muted/30 rounded-xl animate-pulse" />
            ) : (
              losers.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleStockClick(s.code)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                      {s.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[130px] xl:max-w-[160px]">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-foreground">
                      {s.last_price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ArrowDownRight size={10} />
                      {Math.abs(s.diff_percent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
