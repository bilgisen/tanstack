import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface TickerMatch {
  code: string;
  name: string;
  sector: string;
}

interface CompanySearchProps {
  query: string;
  onSelect: (ticker: string) => void;
  onClose?: () => void;
}

const SEARCH_API = "https://hono.paraanaliz.workers.dev/api/ai/ticker-search";

export function CompanySearch({ query, onSelect, onClose }: CompanySearchProps) {
  const [results, setResults] = useState<TickerMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}&limit=6`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose?.();
        break;
    }
  };

  if (results.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-full left-0 right-0 mx-5 mb-2 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider border-b border-border/30">
        Şirket Bulundu
      </div>
      {results.map((item, idx) => (
        <button
          key={item.code}
          onClick={() => onSelect(item.code)}
          onMouseEnter={() => setSelectedIndex(idx)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
            idx === selectedIndex
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Search size={12} className="shrink-0 opacity-50" />
          <span className="font-mono font-semibold shrink-0">{item.code}</span>
          <span className="truncate">{item.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground/50 ml-auto">{item.sector}</span>
        </button>
      ))}
    </div>
  );
}
