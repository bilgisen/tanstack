import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

type SummaryItem = {
  code: string;
  display_name: string;
  last_price: number;
  diff_percent: number;
};

export function LeftSidebar() {
  const [tickers, setTickers] = useState<SummaryItem[]>([]);

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
    { code: "XU100", display_name: "BIST 100", last_price: 10245.5, diff_percent: 1.2 },
    { code: "USDTRY", display_name: "USD/TRY", last_price: 34.52, diff_percent: 0.12 },
    { code: "EURTRY", display_name: "EUR/TRY", last_price: 38.10, diff_percent: -0.05 },
    { code: "BTCUSD", display_name: "BTC/USD", last_price: 64500.0, diff_percent: 2.4 },
    { code: "XAUUSD", display_name: "Altın/USD", last_price: 2450.1, diff_percent: -0.3 },
  ];

  const getRoute = (code: string) => {
    if (code === "USDTRY" || code === "EURTRY") return `/forex/${code}`;
    if (code === "BTCUSD") return "/kripto";
    if (code === "XAUUSD") return "/emtia";
    return "/borsa";
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] border-r dark:border-zinc-900 border-zinc-200 dark:bg-zinc-950 bg-white shrink-0 overflow-y-auto z-10">
      <div className="p-4 border-b dark:border-zinc-900 border-zinc-200">
        <h2 className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2">
          <TrendingUp size={14} /> Piyasalar
        </h2>
      </div>
      <div className="flex flex-col p-2 space-y-1">
        {displayTickers.map((t, idx) => {
          const isUp = (t.diff_percent ?? 0) >= 0;
          return (
            <Link
              key={idx}
              to={getRoute(t.code)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm dark:text-zinc-200 text-zinc-800 group-hover:text-emerald-500 transition-colors">{t.display_name}</span>
                <span className="text-xs text-zinc-500">{t.code}</span>
              </div>
              <div className="flex flex-col items-end">
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
