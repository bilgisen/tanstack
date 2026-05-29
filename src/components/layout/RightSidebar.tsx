import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PanelRight } from "lucide-react";
import { useUIStore } from "../../store/ui";
import companyNames from "../../constants/companyNames.json";
import companyLogos from "../../constants/companyLogos.json";

type StockItem = {
  code: string;
  name: string;
  last_price: number;
  diff_percent: number;
  volume?: string | number;
};

type DetailedStats = {
  price: number;
  diffPercent: number;
  high: number;
  low: number;
  volume: string;
  fk: string;
  pddf: string;
  halkaAciklik: string;
  ozsermayeKari: string;
  rsi: string;
  macd: string;
  bollinger: string;
  atrStop: string;
};

export function RightSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.toLowerCase();

  // Route matching state
  const isCompanyPage = pathname.includes("/panel/sirketler/");
  const isIndexPage = pathname.includes("/panel/endeksler/");

  // Market Default View States
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [marketLoading, setLoading] = useState(true);

  // Dynamic Company Details State
  const [companyDetails, setCompanyDetails] = useState<DetailedStats | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [activeCompanyTicker, setActiveCompanyTicker] = useState("");

  // Dynamic Index Components State
  const [indexMeta, setIndexMeta] = useState<any | null>(null);
  const [indexLoading, setIndexLoading] = useState(false);

  const getTickerFromPath = () => {
    const parts = pathname.split("/sirketler/");
    return parts[1] ? parts[1].toUpperCase() : "";
  };

  const getIndexIdFromPath = () => {
    const parts = pathname.split("/endeksler/");
    return parts[1] ? parts[1].toLowerCase() : "";
  };

  // 1. Fetch market data for default "Bugün" panel
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
        const resStocks = await fetch(`${apiUrl}/api/market/stocks`);
        if (resStocks.ok) {
          const json = await resStocks.json();
          if (json.data && Array.isArray(json.data)) {
            setStocks(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load side panel market data", err);
      } finally {
        setLoading(false);
      }
    }

    if (isRightSidebarOpen && !isCompanyPage && !isIndexPage) {
      fetchMarketData();
      const interval = setInterval(fetchMarketData, 30000);
      return () => clearInterval(interval);
    }
  }, [isRightSidebarOpen, isCompanyPage, isIndexPage]);

  // 2. Fetch company details if on a company page
  useEffect(() => {
    if (!isCompanyPage) return;
    const ticker = getTickerFromPath();
    if (!ticker) return;

    setActiveCompanyTicker(ticker);
    setCompanyLoading(true);

    async function fetchCompanyStats() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
        const fallbackPrice = 100.0;
        let lastPrice = fallbackPrice;
        let diffPercent = 0.0;

        // Fetch symbol base price
        const symbolRes = await fetch(`${apiUrl}/api/market/symbol/${ticker}`);
        if (symbolRes.ok) {
          const sJson = await symbolRes.json();
          if (sJson.success && sJson.data) {
            lastPrice = sJson.data.last_price || sJson.data.last || fallbackPrice;
            diffPercent = sJson.data.diff_percent || 0.0;
          }
        }

        // Fetch metrics
        let apiDetail = { fk: "8.50", pddf: "1.20", halka_aciklik: "40.0%", ozsermayeKari: "18.0%" };
        try {
          const detailRes = await fetch(`${apiUrl}/api/market/symbol/${ticker}/detail`);
          if (detailRes.ok) {
            const dJson = await detailRes.json();
            if (dJson.success && dJson.data) apiDetail = dJson.data;
          }
        } catch (_) {}

        // Fetch technical indicators summary
        let apiTa = { rsi: "50.0", macd: "Nötr", bollinger_status: "Orta Bantta", atr_stop_loss: lastPrice * 0.97 };
        try {
          const taRes = await fetch(`${apiUrl}/api/market/symbol/${ticker}/ta/summary`);
          if (taRes.ok) {
            const tJson = await taRes.json();
            if (tJson) apiTa = tJson;
          }
        } catch (_) {}

        // Fetch compact summary card
        let apiSummaryCard: any = null;
        try {
          const cardRes = await fetch(`${apiUrl}/api/market/symbol/${ticker}/summary-card`);
          if (cardRes.ok) {
            const cJson = await cardRes.json();
            if (cJson && !cJson.error) apiSummaryCard = cJson;
          }
        } catch (_) {}

        setCompanyDetails({
          price: apiSummaryCard?.last_price || lastPrice,
          diffPercent: apiSummaryCard?.diff_percent !== undefined ? apiSummaryCard.diff_percent : diffPercent,
          high: apiSummaryCard?.high || lastPrice * 1.02,
          low: apiSummaryCard?.low || lastPrice * 0.98,
          volume: (apiSummaryCard?.volume || "250M TL").replace("TL", "₺").replace("TRY", "₺"),
          fk: (apiDetail as any).fk || (apiDetail as any).FK || "8.50",
          pddf: (apiDetail as any).pddf || (apiDetail as any).PD_DD || "1.20",
          halkaAciklik: (apiDetail as any).halka_aciklik_orani || "40.0%",
          ozsermayeKari: (apiDetail as any).ozsermaye_karliligi || "18.0%",
          rsi: apiSummaryCard ? `${apiSummaryCard.rsi.toFixed(1)} (${apiSummaryCard.rsi_status})` : ((apiTa as any).rsi_status || "50.0 (Nötr)"),
          macd: apiSummaryCard ? apiSummaryCard.macd_status : ((apiTa as any).macd_status || "Nötr"),
          bollinger: (apiTa as any).bollinger_status || "Orta Bantta",
          atrStop: apiSummaryCard?.stop_loss ? `${apiSummaryCard.stop_loss.toFixed(2)} ₺` : `${(apiTa.atr_stop_loss || lastPrice * 0.97).toFixed(2)} ₺`,
        });
      } catch (err) {
        console.error("Failed to load company metrics for sidebar", err);
      } finally {
        setCompanyLoading(false);
      }
    }

    fetchCompanyStats();
  }, [pathname, isCompanyPage]);

  // 3. Fetch index details if on an index page
  useEffect(() => {
    if (!isIndexPage) return;
    const indexId = getIndexIdFromPath();
    if (!indexId) return;

    setIndexLoading(true);

    const indexMetadata: Record<string, any> = {
      bist30: { name: "BIST 30 Endeksi", code: "XU030" },
      bist100: { name: "BIST 100 Endeksi", code: "XU100" },
      bist500: { name: "BIST 500 Endeksi", code: "XU500" },
      bistbanka: { name: "BIST Bankacılık", code: "XBANK" },
    };

    const currentMeta = indexMetadata[indexId] || { name: "BIST Endeksi", code: "XU100" };

    async function fetchIndexStats() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
        const res = await fetch(`${apiUrl}/api/market/summary`);
        let liveVal = "10.000,00";
        let liveDf = 0.0;

        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const apiItem = json.data.find((item: any) => item.code.toUpperCase() === currentMeta.code);
            if (apiItem) {
              liveVal = apiItem.last_price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              liveDf = apiItem.diff_percent || 0.0;
            }
          }
        }

        // Fetch constituent list
        const resList = await fetch(`${apiUrl}/api/market/stocks`);
        let list: any[] = [];
        if (resList.ok) {
          const listJson = await resList.json();
          if (listJson.data && Array.isArray(listJson.data)) {
            list = listJson.data.slice(0, 6); // Grab some active stocks
          }
        }

        setIndexMeta({
          name: currentMeta.name,
          code: currentMeta.code,
          value: liveVal,
          diff: liveDf,
          components: list.length > 0 ? list : [
            { code: "THYAO", name: "Türk Hava Yolları", last_price: 312.50, diff_percent: 4.82 },
            { code: "TUPRS", name: "Tüpraş", last_price: 185.40, diff_percent: 3.12 },
            { code: "KCHOL", name: "Koç Holding", last_price: 242.10, diff_percent: 2.85 },
            { code: "AKBNK", name: "Akbank", last_price: 58.40, diff_percent: -3.42 },
          ]
        });
      } catch (err) {
        console.error("Failed to load index data for sidebar", err);
      } finally {
        setIndexLoading(false);
      }
    }

    fetchIndexStats();
  }, [pathname, isIndexPage]);

  // Default fallback lists
  const fallbackStocks: StockItem[] = [
    { code: "THYAO", name: "Türk Hava Yolları", last_price: 312.50, diff_percent: 4.82 },
    { code: "TUPRS", name: "Tüpraş", last_price: 185.40, diff_percent: 3.12 },
    { code: "KCHOL", name: "Koç Holding", last_price: 242.10, diff_percent: 2.85 },
    { code: "AKBNK", name: "Akbank", last_price: 58.40, diff_percent: -3.42 },
    { code: "EREGL", name: "Ereğli Demir Çelik", last_price: 48.12, diff_percent: -2.85 },
    { code: "YKBNK", name: "Yapı Kredi Bankası", last_price: 32.10, diff_percent: -4.15 },
  ];

  const listStocks = stocks.length > 0 ? stocks : fallbackStocks;
  const gainers = [...listStocks].filter((s) => s.diff_percent > 0).sort((a, b) => b.diff_percent - a.diff_percent).slice(0, 5);
  const losers = [...listStocks].filter((s) => s.diff_percent < 0).sort((a, b) => a.diff_percent - b.diff_percent).slice(0, 5);

  const officialName = (companyNames as Record<string, string>)[activeCompanyTicker] || `${activeCompanyTicker} Anonim Şirketi`;

  return (
    <aside 
      className={`
        flex flex-col border-l border-border bg-background text-foreground shrink-0 transition-all duration-300 h-full overflow-hidden
        fixed inset-y-0 right-0 z-50 lg:static
        ${isRightSidebarOpen 
          ? "w-[290px] sm:w-[330px] xl:w-[360px] translate-x-0 border-l border-border/80" 
          : "w-0 translate-x-full lg:w-0 lg:translate-x-0 lg:border-none"
        }
      `}
    >
      {/* Dynamic Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border/60 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <span className="text-xs font-semibold tracking-tight text-foreground/80 uppercase">
          {isCompanyPage ? officialName : isIndexPage ? (indexMeta?.name || "Endeks Detayı") : "Piyasa Özeti"}
        </span>
        <button 
          onClick={toggleRightSidebar}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
          title="Paneli Kapat"
        >
          <PanelRight size={14} />
        </button>
      </div>

      {/* Dynamic Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* VIEW 1: Active Company Detail Sidebar Panel */}
        {isCompanyPage && (
          companyLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-muted/40 rounded-xl" />
              <div className="h-32 bg-muted/40 rounded-xl" />
              <div className="h-32 bg-muted/40 rounded-xl" />
            </div>
          ) : companyDetails ? (
            <div className="space-y-6 text-sm">
              
              {/* Section 1: Güncel Değerler */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Güncel Değerler</h3>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                      {companyLogos[activeCompanyTicker as keyof typeof companyLogos] ? (
                        <img src={`/logos/${companyLogos[activeCompanyTicker as keyof typeof companyLogos]}`} className="w-5 h-5 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                      ) : null}
                      <span>Anlık Fiyat</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{companyDetails.price.toFixed(2)} ₺</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${companyDetails.diffPercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                        {companyDetails.diffPercent > 0 ? "+" : ""}{companyDetails.diffPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">En Yüksek / En Düşük</span>
                    <span className="font-medium text-foreground">{companyDetails.high.toFixed(2)} / {companyDetails.low.toFixed(2)} ₺</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">İşlem Hacmi</span>
                    <span className="font-medium text-foreground">{companyDetails.volume}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Teknik Analiz */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Teknik Analiz Sinyalleri</h3>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <span className="font-semibold text-foreground">{companyDetails.rsi}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">MACD</span>
                    <span className="font-semibold text-foreground">{companyDetails.macd}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bollinger</span>
                    <span className="font-semibold text-foreground">{companyDetails.bollinger}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pivot Destek / Direnç</span>
                    <span className="font-semibold text-emerald-500">Dst: {((2 * ((companyDetails.high + companyDetails.low + companyDetails.price) / 3)) - companyDetails.high).toFixed(2)} ₺</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">ATR Stop-Loss</span>
                    <span className="font-semibold text-primary">{companyDetails.atrStop}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Temel Analiz */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Temel Analiz Rasyoları</h3>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fiyat / Kazanç (F/K)</span>
                    <span className="font-semibold text-foreground">{companyDetails.fk}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">PD / DD</span>
                    <span className="font-semibold text-foreground">{companyDetails.pddf}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Halka Açıklık Oranı</span>
                    <span className="font-semibold text-foreground">{companyDetails.halkaAciklik}</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Özsermaye Karlılığı</span>
                    <span className="font-semibold text-foreground">{companyDetails.ozsermayeKari}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">Veri yüklenemedi.</div>
          )
        )}

        {/* VIEW 2: Active Index Components Sidebar Panel */}
        {isIndexPage && (
          indexLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-muted/40 rounded-xl" />
              <div className="h-44 bg-muted/40 rounded-xl" />
            </div>
          ) : indexMeta ? (
            <div className="space-y-6 text-sm">
              <div className="space-y-3">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Endeks Bilgisi</h3>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-medium">Değer / Puan</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{indexMeta.value}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${indexMeta.diff >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                        {indexMeta.diff > 0 ? "+" : ""}{indexMeta.diff.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Endeks Bileşenleri</h3>
                <div className="space-y-1.5">
                  {indexMeta.components.map((c: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => navigate({ to: `/panel/sirketler/${c.code.toLowerCase()}` as any })}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {companyLogos[c.code as keyof typeof companyLogos] ? (
                          <img src={`/logos/${companyLogos[c.code as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                        ) : null}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{c.code}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{c.name || "BIST Şirketi"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-foreground">{(c.last_price || c.price || 0).toFixed(2)}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${(c.diff_percent || c.diff || 0) >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                          {(c.diff_percent || c.diff || 0) > 0 ? "+" : ""}{(c.diff_percent || c.diff || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">Endeks verisi yüklenemedi.</div>
          )
        )}

        {/* VIEW 3: General Market Overview (Top Gainers & Losers) */}
        {!isCompanyPage && !isIndexPage && (
          <>
            {/* Top Gainers */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-[11px] uppercase tracking-wider">
                <TrendingUp size={14} />
                <span>En Çok Yükselenler</span>
              </div>
              <div className="space-y-1.5">
                {marketLoading ? (
                  <div className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                ) : (
                  gainers.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate({ to: `/panel/sirketler/${s.code.toLowerCase()}` as any })}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {companyLogos[s.code as keyof typeof companyLogos] ? (
                          <img src={`/logos/${companyLogos[s.code as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                        ) : null}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                            {s.code}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[130px] xl:max-w-[160px]">
                            {s.name}
                          </span>
                        </div>
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
              <div className="flex items-center gap-1.5 text-destructive font-semibold text-[11px] uppercase tracking-wider">
                <TrendingDown size={14} />
                <span>En Çok Düşenler</span>
              </div>
              <div className="space-y-1.5">
                {marketLoading ? (
                  <div className="h-24 bg-muted/20 rounded-xl animate-pulse" />
                ) : (
                  losers.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate({ to: `/panel/sirketler/${s.code.toLowerCase()}` as any })}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {companyLogos[s.code as keyof typeof companyLogos] ? (
                          <img src={`/logos/${companyLogos[s.code as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                        ) : null}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                            {s.code}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[130px] xl:max-w-[160px]">
                            {s.name}
                          </span>
                        </div>
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
          </>
        )}

      </div>
    </aside>
  );
}
