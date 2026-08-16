import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface TickerMatch {
  code: string;
  name: string;
  sector: string;
}

interface CompanySearchProps {
  query: string;
  onSelect: (ticker: string) => void;
  onAskAI?: (ticker: string) => void;
  onClose?: () => void;
}

const SEARCH_API = "https://hono.jetborsa.workers.dev/api/ai/ticker-search";

export function CompanySearch({ query, onSelect, onAskAI, onClose }: CompanySearchProps) {
  const [results, setResults] = useState<Array<TickerMatch>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleNavigateToPage = (code: string) => {
    const isIndex = /^X[A-Z0-9]+$/i.test(code);
    if (isIndex) {
      navigate({ to: `/endeksler/${code.toLowerCase()}` });
    } else {
      navigate({ to: `/hisse/${code.toLowerCase()}` });
    }
    if (onClose) onClose();
  };

  const handleAskAI = (code: string) => {
    if (onAskAI) {
      onAskAI(code);
    } else {
      onSelect(code);
    }
    if (onClose) onClose();
  };

  if (results.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-full left-0 right-0 mx-3 sm:mx-5 mb-2 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 font-sans"
    >
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider border-b border-border/30 bg-muted/20">
        <span>Arama Sonuçları</span>
        <span className="text-[9px] text-muted-foreground/50 font-normal">
          [Sayfaya Git] veya [AI'ya Sor]
        </span>
      </div>

      <div className="divide-y divide-border/10 max-h-60 overflow-y-auto custom-scrollbar">
        {results.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item.code}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                isSelected ? "bg-primary/10" : "hover:bg-muted/20"
              }`}
            >
              {/* Ticker & Name */}
              <div 
                onClick={() => handleNavigateToPage(item.code)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pr-2"
              >
                <Search size={12} className="shrink-0 text-muted-foreground/60" />
                <span className="font-mono font-bold text-foreground shrink-0">{item.code}</span>
                <span className="truncate text-muted-foreground font-medium">{item.name}</span>
              </div>

              {/* Dual Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigateToPage(item.code)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/40 hover:bg-primary hover:text-white transition-all text-[11px] font-medium text-foreground cursor-pointer active:scale-95"
                  title={`${item.code} Sayfasına Git`}
                >
                  <ArrowUpRight size={12} />
                  <span className="hidden sm:inline">Sayfaya Git</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAskAI(item.code)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[11px] font-medium cursor-pointer active:scale-95"
                  title={`${item.code} Hakkında Yapay Zekaya Sor`}
                >
                  <Sparkles size={11} />
                  <span className="hidden sm:inline">AI'ya Sor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
