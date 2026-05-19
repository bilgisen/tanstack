import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useUIStore } from "../../store/ui";
import type { Theme } from "../../store/ui";


type SummaryItem = {
  code: string;
  display_name: string;
  last_price: number;
  diff_percent: number;
};

export function Bottombar() {
  const [tickers, setTickers] = useState<SummaryItem[]>([]);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

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

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Açık" },
    { value: "dark", icon: Moon, label: "Koyu" },
    { value: "system", icon: Monitor, label: "Sistem" },
  ];

  return (
    <footer className="h-8 border-t dark:border-zinc-900 border-zinc-200 dark:bg-zinc-950 bg-white flex items-center justify-between px-4 shrink-0 select-none transition-colors z-10">
      <div className="flex items-center text-xs dark:text-zinc-500 text-zinc-400">
        <span className="font-semibold text-zinc-500 dark:text-zinc-400 mr-1.5">SumoTerminal</span>
        <span>© 2026 | Yapay Zekayla Güçlendirilmiş Finans Platformu</span>
      </div>

      <div className="flex items-center gap-1 h-full dark:bg-zinc-950 bg-white relative shrink-0">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              title={opt.label}
              className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                isActive
                  ? "dark:bg-zinc-900 bg-zinc-100 text-emerald-500 shadow-sm"
                  : "dark:text-zinc-500 text-zinc-400 dark:hover:text-zinc-350 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <Icon size={12} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
            </button>
          );
        })}
      </div>
    </footer>
  );
}

