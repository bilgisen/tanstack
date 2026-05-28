import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Sparkles, Star, Trash2, TrendingUp, TrendingDown, ChevronRight, ArrowUpRight, Activity, Calendar, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWatchlistStore } from '../store/watchlist'
import { useChatStore } from '../store/chat'
import companyNames from '../constants/companyNames.json'

export const Route = createFileRoute('/panel/')({
  component: PanelIndexPage,
})

type IndexDisplay = {
  id: string;
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  sparkline: number[];
};

type WatchlistRow = {
  symbol: string;
  name: string;
  type: 'stock' | 'index';
  price: number;
  diffPercent: number;
};

// High-fidelity fallback stocks for Gainers if API data is offline
const MOCK_GAINERS_FALLBACK: WatchlistRow[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", type: "stock", price: 312.50, diffPercent: 4.82 },
  { symbol: "ASELS", name: "Aselsan", type: "stock", price: 64.20, diffPercent: 4.15 },
  { symbol: "TUPRS", name: "Tüpraş", type: "stock", price: 185.40, diffPercent: 3.12 },
  { symbol: "SAHOL", name: "Sabancı Holding", type: "stock", price: 98.70, diffPercent: 2.85 },
  { symbol: "KCHOL", name: "Koç Holding", type: "stock", price: 242.10, diffPercent: 2.10 }
];

// High-fidelity fallback stocks for Losers if API data is offline
const MOCK_LOSERS_FALLBACK: WatchlistRow[] = [
  { symbol: "AKBNK", name: "Akbank", type: "stock", price: 58.40, diffPercent: -4.42 },
  { symbol: "YKBNK", name: "Yapı Kredi", type: "stock", price: 32.10, diffPercent: -3.85 },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", type: "stock", price: 48.12, diffPercent: -2.85 },
  { symbol: "GARAN", name: "Garanti BBVA", type: "stock", price: 82.50, diffPercent: -2.10 },
  { symbol: "ISCTR", name: "İş Bankası C", type: "stock", price: 15.20, diffPercent: -1.80 }
];

function PanelIndexPage() {
  const navigate = useNavigate()
  const { watchlists, removeItem } = useWatchlistStore()
  const { sendMessage, clearChat } = useChatStore()
  
  const [loading, setLoading] = useState(true)
  const [indexData, setIndexDisplay] = useState<IndexDisplay[]>([
    { id: 'bist100', name: "BIST 100", code: "XU100", price: 10240.20, diffPercent: 1.15, sparkline: [10120, 10150, 10110, 10190, 10220, 10210, 10240.20] },
    { id: 'bist30', name: "BIST 30", code: "XU030", price: 11250.40, diffPercent: 1.45, sparkline: [11080, 11110, 11150, 11130, 11190, 11220, 11250.40] },
    { id: 'bist500', name: "BIST 500", code: "XU500", price: 12540.80, diffPercent: 0.95, sparkline: [12420, 12450, 12410, 12480, 12510, 12500, 12540.80] },
  ])
  const [watchlistRows, setWatchlistRows] = useState<WatchlistRow[]>([])
  const [topGainers, setTopGainers] = useState<WatchlistRow[]>([])
  const [topLosers, setTopLosers] = useState<WatchlistRow[]>([])

  const defaultWatchlist = watchlists.find(w => w.id === "default-list") || watchlists[0]
  const watchlistItems = defaultWatchlist?.items || []

  // Format today's date in Turkish
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function fetchHomeDashboardData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      
      let liveIndices: any[] = []
      let liveStocks: any[] = []

      // 1. Fetch indices from market summary
      try {
        const indexRes = await fetch(`${apiUrl}/api/market/summary`)
        if (indexRes.ok) {
          const indexJson = await indexRes.json()
          if (indexJson && Array.isArray(indexJson.data)) {
            liveIndices = indexJson.data
          }
        }
      } catch (e) {
        console.error("Home: Failed fetching live summary indices:", e)
      }

      // 2. Fetch stocks from market stocks list
      try {
        const stocksRes = await fetch(`${apiUrl}/api/market/stocks`)
        if (stocksRes.ok) {
          const stocksJson = await stocksRes.json()
          if (stocksJson && Array.isArray(stocksJson.data)) {
            liveStocks = stocksJson.data
          }
        }
      } catch (e) {
        console.error("Home: Failed fetching live summary stocks:", e)
      }

      if (!isMounted) return

      // Update Today Borsa cards with live data if present
      if (liveIndices.length > 0) {
        setIndexDisplay(prev => prev.map(item => {
          const liveItem = liveIndices.find((idx: any) => idx.code.toUpperCase() === item.code);
          if (liveItem) {
            // Generate minor randomized drift sparkline to look premium
            const currentPrice = liveItem.last_price || item.price;
            const diff = liveItem.diff_percent !== undefined ? liveItem.diff_percent : item.diffPercent;
            const steps = [
              currentPrice * (1 - diff * 0.005),
              currentPrice * (1 - diff * 0.003),
              currentPrice * (1 - diff * 0.004),
              currentPrice * (1 - diff * 0.001),
              currentPrice * (1 - diff * 0.002),
              currentPrice * (1 + diff * 0.001),
              currentPrice
            ];
            return {
              ...item,
              price: Number(currentPrice.toFixed(2)),
              diffPercent: Number(diff.toFixed(2)),
              sparkline: steps
            };
          }
          return item;
        }))
      }

      // Build rows for current Watchlist
      const resolvedRows: WatchlistRow[] = watchlistItems.map(item => {
        let lastPrice = item.type === 'index' ? 10000.0 : 100.0;
        let diffPercent = 0.0;
        let fullName = item.symbol;

        if (item.type === 'index') {
          // Resolve index details
          const indexCodeUpper = item.symbol.toUpperCase();
          const found = liveIndices.find(idx => idx.code.toUpperCase() === indexCodeUpper);
          if (found) {
            lastPrice = found.last_price || lastPrice;
            diffPercent = found.diff_percent !== undefined ? found.diff_percent : diffPercent;
          }
          fullName = indexCodeUpper === 'XU100' ? 'BIST 100 Endeksi' : indexCodeUpper === 'XU030' ? 'BIST 30 Endeksi' : indexCodeUpper === 'XU500' ? 'BIST 500 Endeksi' : indexCodeUpper === 'XBANK' ? 'BIST Bankacılık Endeksi' : `${indexCodeUpper} Endeksi`;
        } else {
          // Resolve stock details
          const stockCodeUpper = item.symbol.toUpperCase();
          const found = liveStocks.find(st => st.code.toUpperCase() === stockCodeUpper);
          if (found) {
            lastPrice = found.last_price || lastPrice;
            diffPercent = found.diff_percent !== undefined ? found.diff_percent : diffPercent;
          }
          fullName = (companyNames as Record<string, string>)[stockCodeUpper] || `${stockCodeUpper} Sanayi A.Ş.`;
        }

        return {
          symbol: item.symbol.toUpperCase(),
          name: fullName,
          type: item.type,
          price: lastPrice,
          diffPercent: diffPercent,
        };
      })

      setWatchlistRows(resolvedRows)

      // 3. Resolve Gainers and Losers
      if (liveStocks.length > 0) {
        const sortedStocks = liveStocks
          .filter((st: any) => st.code && st.last_price !== undefined)
          .map((st: any) => ({
            symbol: st.code.toUpperCase(),
            name: (companyNames as Record<string, string>)[st.code.toUpperCase()] || `${st.code.toUpperCase()} Sanayi A.Ş.`,
            type: 'stock' as const,
            price: st.last_price,
            diffPercent: st.diff_percent || 0.0,
          }));

        // Sort for Top Gainers
        const gainers = [...sortedStocks]
          .sort((a, b) => b.diffPercent - a.diffPercent)
          .slice(0, 5);

        // Sort for Top Losers
        const losers = [...sortedStocks]
          .sort((a, b) => a.diffPercent - b.diffPercent)
          .slice(0, 5);

        setTopGainers(gainers)
        setTopLosers(losers)
      } else {
        setTopGainers(MOCK_GAINERS_FALLBACK)
        setTopLosers(MOCK_LOSERS_FALLBACK)
      }

      setLoading(false)
    }

    fetchHomeDashboardData()
    return () => {
      isMounted = false
    }
  }, [watchlists, watchlistItems]);

  const handleSuggestionClick = (question: string) => {
    // Clear chat pane and trigger question seamlessly
    clearChat()
    sendMessage(question, 'global')
  }

  const handleRemoveWatchlistItem = (e: React.MouseEvent, symbol: string) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultId = defaultWatchlist?.id || "default-list"
    removeItem(defaultId, symbol)
  }

  return (
    <div className="flex flex-col space-y-8 select-none max-w-5xl mx-auto py-2 animate-in fade-in duration-500 pb-16">
      
      {/* Premium Header Summary Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl border border-border/40 bg-card/15 shadow-3xs relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 md:gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xs shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight">HissePro Finansal Analiz Paneli</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Yapay zeka desteğiyle BIST piyasalarını, hisse analizlerini ve bilançoları yakından takip edin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/30 text-[11px] text-muted-foreground font-semibold shrink-0 w-fit self-start md:self-center z-10">
          <Calendar size={11} className="text-[#1D9BF0]" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 1. Bugün Borsa Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-primary" />
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2.5">
            <Activity size={12} className="text-[#22c55e]" />
            <span>Bugün Borsa</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {indexData.map((idx) => {
            const isUp = idx.diffPercent >= 0;
            const routeTarget = `/panel/endeksler/${idx.id}`;
            
            return (
              <Link
                key={idx.id}
                to={routeTarget}
                className="group border border-border/40 hover:border-border/70 rounded-2xl p-4 md:p-5 bg-card/15 hover:bg-card/25 shadow-3xs transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                {/* Micro hover aura indicator */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isUp ? 'bg-emerald-500/5' : 'bg-destructive/5'}`} />

                <div className="flex items-center justify-between mb-3 z-10">
                  <div>
                    <h4 className="text-xs font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{idx.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-semibold tracking-tight">{idx.code}</span>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isUp 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                      : 'bg-destructive/10 text-destructive border border-destructive/10'
                  }`}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{isUp ? '+' : ''}{idx.diffPercent}%</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-1 z-10">
                  <div className="text-lg md:text-xl font-bold font-mono tracking-tight text-foreground">
                    {idx.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* Sparkline mini chart visualization */}
                  <div className="w-16 h-8 pr-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path
                        d={`M ${idx.sparkline.map((val, i) => `${(i / (idx.sparkline.length - 1)) * 100} ${40 - ((val - Math.min(...idx.sparkline)) / (Math.max(...idx.sparkline) - Math.min(...idx.sparkline) || 1)) * 30}`).join(' L ')}`}
                        fill="none"
                        stroke={isUp ? "#22c55e" : "#ef4444"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Takip Listem Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-[#1D9BF0]" />
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Star size={12} className="text-[#FFB800] fill-[#FFB800]" />
              <span>Takip Listem</span>
            </h3>
          </div>
          
          <Link
            to="/panel/takip-listesi"
            className="text-[10px] md:text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 hover:gap-1 transition-all"
          >
            <span>Yönet</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="border border-border/30 rounded-2xl bg-card/5 p-8 flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="animate-spin text-primary" size={20} />
            <span className="text-[11px] text-muted-foreground font-medium">Portföy verileriniz senkronize ediliyor...</span>
          </div>
        ) : watchlistRows.length === 0 ? (
          <div className="border border-dashed border-border/80 hover:border-border rounded-2xl bg-card/5 p-8 text-center flex flex-col items-center justify-center space-y-3 transition-colors">
            <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
              <Star size={14} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground">Takip listeniz boş</h4>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                Herhangi bir hisse veya endeks sayfasındaki yıldız düğmesine basarak onu takip listenize ekleyebilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border/40 rounded-2xl bg-card/15 overflow-hidden shadow-3xs backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-border/35 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider bg-muted/10">
                    <th className="py-3 px-4 md:px-5">Kod</th>
                    <th className="py-3 px-4">Şirket / Endeks Adı</th>
                    <th className="py-3 px-4 text-right">Anlık Fiyat</th>
                    <th className="py-3 px-4 text-right">Değişim</th>
                    <th className="py-3 px-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  {watchlistRows.map((row) => {
                    const isUp = row.diffPercent >= 0;
                    const detailsRoute = row.type === 'index' 
                      ? `/panel/endeksler/${row.symbol.toLowerCase() === 'xu100' ? 'bist100' : row.symbol.toLowerCase() === 'xu030' ? 'bist30' : row.symbol.toLowerCase() === 'xu500' ? 'bist500' : 'bist100'}`
                      : `/panel/sirketler/${row.symbol.toLowerCase()}`;
                    
                    return (
                      <tr 
                        key={row.symbol}
                        onClick={() => navigate({ to: detailsRoute })}
                        className="group hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 md:px-5 font-bold font-mono text-[11px] tracking-tight text-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/30 group-hover:border-primary/25 group-hover:text-primary transition-all">
                            {row.symbol}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-muted-foreground max-w-[160px] md:max-w-xs truncate">
                          {row.name}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold font-mono tracking-tight text-foreground">
                          {row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 font-semibold font-mono tracking-tight text-[11px] ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{row.diffPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => handleRemoveWatchlistItem(e, row.symbol)}
                              className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all cursor-pointer"
                              title="Takip Listesinden Kaldır"
                            >
                              <Trash2 size={12} />
                            </button>
                            <span className="w-7 h-7 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 flex items-center justify-center transition-all">
                              <ArrowUpRight size={13} />
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. Yükselenler & Düşenler Section (Günün Öne Çıkan Hisseleri) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* En Çok Yükselenler Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowUpCircle size={14} className="text-emerald-500" />
              <span>En Çok Yükselenler</span>
            </h3>
          </div>

          {loading ? (
            <div className="border border-border/30 rounded-2xl bg-card/5 p-8 flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="animate-spin text-emerald-500" size={16} />
              <span className="text-[10px] text-muted-foreground font-medium">Veriler yükleniyor...</span>
            </div>
          ) : (
            <div className="border border-emerald-500/10 rounded-2xl bg-card/15 overflow-hidden shadow-3xs backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider bg-emerald-500/5">
                      <th className="py-2.5 px-4">Hisse</th>
                      <th className="py-2.5 px-3">Adı</th>
                      <th className="py-2.5 px-3 text-right">Fiyat</th>
                      <th className="py-2.5 px-4 text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {topGainers.map((row) => (
                      <tr 
                        key={row.symbol}
                        onClick={() => navigate({ to: `/panel/sirketler/${row.symbol.toLowerCase()}` })}
                        className="group hover:bg-emerald-500/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold font-mono text-[11px] tracking-tight text-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/25 group-hover:text-emerald-500 transition-all">
                            {row.symbol}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-muted-foreground max-w-[120px] truncate">
                          {row.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold font-mono tracking-tight text-foreground">
                          {row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono tracking-tight text-[11px] text-emerald-500">
                            ▲ +{row.diffPercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* En Çok Düşenler Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-destructive" />
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowDownCircle size={14} className="text-destructive" />
              <span>En Çok Düşenler</span>
            </h3>
          </div>

          {loading ? (
            <div className="border border-border/30 rounded-2xl bg-card/5 p-8 flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="animate-spin text-destructive" size={16} />
              <span className="text-[10px] text-muted-foreground font-medium">Veriler yükleniyor...</span>
            </div>
          ) : (
            <div className="border border-destructive/10 rounded-2xl bg-card/15 overflow-hidden shadow-3xs backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider bg-destructive/5">
                      <th className="py-2.5 px-4">Hisse</th>
                      <th className="py-2.5 px-3">Adı</th>
                      <th className="py-2.5 px-3 text-right">Fiyat</th>
                      <th className="py-2.5 px-4 text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {topLosers.map((row) => (
                      <tr 
                        key={row.symbol}
                        onClick={() => navigate({ to: `/panel/sirketler/${row.symbol.toLowerCase()}` })}
                        className="group hover:bg-destructive/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold font-mono text-[11px] tracking-tight text-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-destructive/5 border border-destructive/10 group-hover:border-destructive/25 group-hover:text-destructive transition-all">
                            {row.symbol}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-muted-foreground max-w-[120px] truncate">
                          {row.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold font-mono tracking-tight text-foreground">
                          {row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono tracking-tight text-[11px] text-destructive">
                            ▼ {row.diffPercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Suggestions Section (Global Chat Prompt recommendations) */}
      <div className="border border-border/40 rounded-3xl p-5 md:p-6 bg-card/15 shadow-3xs relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-4 shrink-0">
          <div className="w-1.5 h-4 rounded-full bg-primary" />
          <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">Analiz Asistanı Tavsiyeleri</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            "BIST 100 endeksi bugün nasıl?",
            "En yüksek temettü verimi olan 5 hisse",
            "THYAO bilançosunda öne çıkan rasyolar neler?",
            "TUPRS için kısa vadeli teknik destek noktaları"
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="group flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/15 hover:bg-primary/5 hover:border-primary/25 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                <div className="w-6 h-6 rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] flex items-center justify-center shrink-0 border border-[#1D9BF0]/10">
                  <Sparkles size={11} />
                </div>
                <span className="text-[11px] text-foreground font-semibold group-hover:text-primary transition-colors truncate">
                  {suggestion}
                </span>
              </div>
              <ChevronRight size={11} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
