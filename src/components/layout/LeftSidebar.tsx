import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Maximize, Minimize } from "lucide-react";
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
    { code: "AAPL", display_name: "Apple Inc.", last_price: 224.50, diff_percent: 0.8, volume: 56000000 },
  ];

  const getRoute = (code: string) => {
    if (code === "USDTRY" || code === "EURTRY") return `/forex/${code}`;
    if (code === "BTCUSD") return "/kripto";
    if (code === "XAUUSD") return "/emtia";
    return "/borsa";
  };

  return (
    <aside className={`
      hidden lg:flex flex-col border-r dark:border-zinc-900 border-zinc-200 dark:bg-zinc-950 bg-white shrink-0 z-10 transition-all duration-300 group
      ${isLeftSidebarExpanded ? "flex-1 overflow-y-auto" : "w-[260px] overflow-y-hidden hover:overflow-y-auto"}
    `}>
      <div className="p-4 border-b dark:border-zinc-900 border-zinc-200 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-950 z-20">
        <h2 className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2">
          <TrendingUp size={14} /> İzleme Listesi
        </h2>
        <button 
          onClick={toggleLeftSidebarExpanded}
          className={`w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-all duration-200
            ${isLeftSidebarExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
          title={isLeftSidebarExpanded ? "Daralt" : "Genişlet"}
        >
          {isLeftSidebarExpanded ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
      
      <div className="flex flex-col p-2 space-y-1">
        {displayTickers.map((t, idx) => {
          const isUp = (t.diff_percent ?? 0) >= 0;
          return (
            <Link
              key={idx}
              to={getRoute(t.code)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors group/item"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm dark:text-zinc-200 text-zinc-800 group-hover/item:text-emerald-500 transition-colors">
                  {t.display_name}
                </span>
                <span className="text-xs text-zinc-500">{t.code}</span>
              </div>
              
              {isLeftSidebarExpanded && t.volume && t.volume > 0 && (
                <div className="hidden md:flex flex-col items-center justify-center mx-4 text-zinc-500 text-xs">
                  <span className="font-medium text-zinc-400">Hacim</span>
                  <span>{(t.volume / 1000000).toFixed(1)}M</span>
                </div>
              )}

              <div className="flex flex-col items-end shrink-0">
                <span className="font-medium text-sm dark:text-zinc-100 text-zinc-900">{t.last_price?.toFixed(2)}</span>
                <span className={`text-[11px] font-semibold flex items-center ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(t.diff_percent ?? 0).toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
