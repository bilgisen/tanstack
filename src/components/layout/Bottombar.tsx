import { useEffect, useState } from "react";

type SummaryItem = {
  code: string;
  display_name: string;
  last_price: number;
  diff_percent: number;
};

export function Bottombar() {
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
    { code: "BIST", display_name: "BIST 100", last_price: 10245.5, diff_percent: 1.2 },
    { code: "USDTRY", display_name: "USD/TRY", last_price: 34.52, diff_percent: 0.12 },
    { code: "EURTRY", display_name: "EUR/TRY", last_price: 38.10, diff_percent: -0.05 },
    { code: "BTCUSD", display_name: "BTC/USD", last_price: 64500.0, diff_percent: 2.4 },
    { code: "XAUUSD", display_name: "XAU/USD", last_price: 2450.1, diff_percent: -0.3 },
  ];

  return (
    <footer className="h-8 border-t border-zinc-800 bg-zinc-950 overflow-hidden flex items-center shrink-0">
      <div className="flex animate-marquee whitespace-nowrap px-4 text-xs">
        <div className="flex gap-8 items-center min-w-full justify-around pr-8">
          {displayTickers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-medium text-zinc-400">{t.display_name}</span>
              <span className="text-zinc-200">{t.last_price?.toFixed(2)}</span>
              <span className={(t.diff_percent ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}>
                {(t.diff_percent ?? 0) >= 0 ? "+" : ""}{(t.diff_percent ?? 0).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-8 items-center min-w-full justify-around pr-8">
          {displayTickers.map((t, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-2">
              <span className="font-medium text-zinc-400">{t.display_name}</span>
              <span className="text-zinc-200">{t.last_price?.toFixed(2)}</span>
              <span className={(t.diff_percent ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}>
                {(t.diff_percent ?? 0) >= 0 ? "+" : ""}{(t.diff_percent ?? 0).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
