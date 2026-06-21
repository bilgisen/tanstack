import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Sparkles, HelpCircle, Star, Globe, TrendingUp, Compass, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useChatStore } from '../store/chat'
import { useWatchlistStore } from '../store/watchlist'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import companyLogos from '../constants/companyLogos.json'

export const Route = createFileRoute('/panel/endeksler/$id')({
  component: EndeksDetailPage,
})

type IndexMeta = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  description: string;
  components: { code: string; name: string; price: number; diff: number; volume: string }[];
};

const indexMetadataFallbacks: Record<string, IndexMeta> = {
  bist30: {
    name: "BIST 30 Endeksi",
    code: "XU030",
    price: 11250.40,
    diffPercent: 1.45,
    description: "Borsa İstanbul'da işlem gören, işlem hacmi ve piyasa değeri en yüksek 30 şirketin ortak performansını gösterir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  bist100: {
    name: "BIST 100 Endeksi",
    code: "XU100",
    price: 10240.20,
    diffPercent: 1.15,
    description: "Borsa İstanbul'un ana endeksidir. Piyasa değeri ve işlem hacmi en yüksek 100 hissenin performansını temsil eder.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
      { code: "BIMAS", name: "Bim Mağazalar", price: 385.50, diff: -0.52, volume: "2.1M" },
    ]
  },
  bist500: {
    name: "BIST 500 Endeksi",
    code: "XU500",
    price: 12540.80,
    diffPercent: 0.95,
    description: "Borsa İstanbul'da işlem gören ve en geniş kapsamlı 500 şirketin ortak performansını ölçen endekstir.",
    components: [
      { code: "THYAO", name: "Türk Hava Yolları", price: 312.50, diff: 4.82, volume: "12.4M" },
      { code: "TUPRS", name: "Tüpraş", price: 185.40, diff: 3.12, volume: "8.1M" },
      { code: "ASELS", name: "Aselsan", price: 64.20, diff: 5.12, volume: "11.1M" },
      { code: "KCHOL", name: "Koç Holding", price: 242.10, diff: 2.85, volume: "5.4M" },
      { code: "SAHOL", name: "Sabancı Holding", price: 98.70, diff: -1.25, volume: "4.8M" },
      { code: "EREGL", name: "Ereğli Demir Çelik", price: 48.12, diff: -2.85, volume: "9.2M" },
    ]
  },
  bistbanka: {
    name: "BIST Bankacılık",
    code: "XBANK",
    price: 14520.10,
    diffPercent: -2.15,
    description: "Borsa İstanbul'da işlem gören ve ana faaliyet alanı bankacılık olan tüm finans kurumlarının performansını ölçer.",
    components: [
      { code: "AKBNK", name: "Akbank", price: 58.40, diff: -3.42, volume: "14.2M" },
      { code: "YKBNK", name: "Yapı Kredi", price: 32.10, diff: -4.15, volume: "19.5M" },
      { code: "GARAN", name: "Garanti BBVA", price: 82.50, diff: -0.25, volume: "7.4M" },
      { code: "ISCTR", name: "İş Bankası C", price: 15.20, diff: 1.15, volume: "28.1M" },
      { code: "HALKB", name: "Halkbank", price: 16.40, diff: -1.80, volume: "5.1M" },
      { code: "VAKBN", name: "Vakıfbank", price: 18.10, diff: -2.10, volume: "6.2M" },
    ]
  }
};

function EndeksDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const rawId = id.toLowerCase();
  const currentFallback = indexMetadataFallbacks[rawId] || indexMetadataFallbacks.bist100;

  const [priceDetails, setPriceDetails] = useState<IndexMeta | null>(null)
  const [indexSummary, setIndexSummary] = useState<string[] | null>(null)
  const [techSinyaller, setTechnicalSinyaller] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const { sendMessage } = useChatStore()
  const { watchlists, addItem, removeItem } = useWatchlistStore()

  const defaultWatchlist = watchlists.find(w => w.id === "default-list") || watchlists[0];
  const isStarred = defaultWatchlist?.items.some(item => item.symbol === currentFallback.code);

  const toggleWatchlist = () => {
    const defaultId = defaultWatchlist?.id || "default-list";
    if (isStarred) {
      removeItem(defaultId, currentFallback.code);
    } else {
      addItem(defaultId, currentFallback.code, "index");
    }
  };

  // Load all details on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadIndexData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      
      let liveVal = currentFallback.price;
      let liveDf = currentFallback.diffPercent;
      let apiComponents = [...currentFallback.components];

      // 1. Fetch live index value from market summary
      try {
        const res = await fetch(`${apiUrl}/api/market/summary`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const apiItem = json.data.find((item: any) => item.code.toUpperCase() === currentFallback.code);
            if (apiItem) {
              liveVal = apiItem.last_price || liveVal;
              liveDf = apiItem.diff_percent !== undefined ? apiItem.diff_percent : liveDf;
            }
          }
        }
      } catch (e) {
        console.error("Failed loading live index value", e);
      }

      // 2. Fetch constituent stock details for accuracy
      try {
        const resList = await fetch(`${apiUrl}/api/market/stocks`);
        if (resList.ok) {
          const listJson = await resList.json();
          if (listJson.data && Array.isArray(listJson.data)) {
            // Match our constituent codes with live stock prices
            apiComponents = currentFallback.components.map((fallbackComp) => {
              const liveStock = listJson.data.find((item: any) => item.code.toUpperCase() === fallbackComp.code);
              return {
                code: fallbackComp.code,
                name: fallbackComp.name,
                price: liveStock ? liveStock.last_price : fallbackComp.price,
                diff: liveStock ? liveStock.diff_percent : fallbackComp.diff,
                volume: fallbackComp.volume,
              };
            });
          }
        }
      } catch (e) {
        console.error("Failed fetching live components list", e);
      }

      // 3. Fetch technical signals for index
      let indexRsi = "54.1 (Nötr)";
      let indexMacd = "Nötr";
      let indexBollinger = "Orta Bantta";
      let indexStop = `${(liveVal * 0.97).toFixed(0)}`;
      let indexDestek = `${(liveVal * 0.96).toFixed(0)}`;
      let indexDirenc = `${(liveVal * 1.04).toFixed(0)}`;

      try {
        const taRes = await fetch(`${apiUrl}/api/market/symbol/${currentFallback.code}/ta/summary`);
        if (taRes.ok) {
          const tJson = await taRes.json();
          if (tJson && !tJson.error) {
            const formatRsiValue = (val: any) => {
              if (val === undefined || val === null) return "50.0";
              const num = typeof val === "number" ? val : parseFloat(val);
              return isNaN(num) ? "50.0" : num.toFixed(1);
            };
            const formatNumberValue = (val: any, decimals: number, fallback: string) => {
              if (val === undefined || val === null) return fallback;
              const num = typeof val === "number" ? val : parseFloat(val);
              return isNaN(num) ? fallback : num.toFixed(decimals);
            };
            indexRsi = `${formatRsiValue(tJson.rsi)} (${tJson.rsi_status || "Nötr"})`;
            indexMacd = tJson.macd_status || "Nötr";
            indexBollinger = tJson.bollinger_status || "Orta Bantta";
            indexStop = tJson.stop_loss ? `${formatNumberValue(tJson.stop_loss, 0, (liveVal * 0.97).toFixed(0))}` : indexStop;
            indexDestek = tJson.support ? `${formatNumberValue(tJson.support, 0, (liveVal * 0.96).toFixed(0))}` : indexDestek;
            indexDirenc = tJson.resistance ? `${formatNumberValue(tJson.resistance, 0, (liveVal * 1.04).toFixed(0))}` : indexDirenc;
          }
        }
      } catch (_) {}

      // 4. Fetch AI Summary paragraphs for index
      let paragraphs = [
        `**${currentFallback.name} (${currentFallback.code})**, işlem gören en likit hisselerin performans ağırlıklı ortalamasıyla son dönemde dengeli bir seyir izlemektedir.`,
        "Küresel piyasalardaki sektörel rotasyonlar ve hacim bazlı değişimler endeks trendi üzerinde doğrudan belirleyici olmaktadır."
      ];

      try {
        const summaryRes = await fetch(`${apiUrl}/api/market/symbol/${currentFallback.code}/header-summary`);
        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          if (summaryJson) {
            if (summaryJson.paragraphs && summaryJson.paragraphs.length > 0) {
              paragraphs = summaryJson.paragraphs;
            }
          }
        }
      } catch (_) {}

      if (!isMounted) return;

      setPriceDetails({
        name: currentFallback.name,
        code: currentFallback.code,
        price: liveVal,
        diffPercent: liveDf,
        description: currentFallback.description,
        components: apiComponents,
      });

      setTechnicalSinyaller({
        rsi: indexRsi,
        macd: indexMacd,
        bollinger: indexBollinger,
        atrStop: indexStop,
        destek: indexDestek,
        direnc: indexDirenc,
      });

      setIndexSummary(paragraphs);
      setLoading(false);
    }

    loadIndexData();
    return () => {
      isMounted = false;
    };
  }, [id, currentFallback.code]);

  if (loading || !priceDetails) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={16} />
        <span>Veriler yükleniyor, lütfen bekleyin...</span>
      </div>
    );
  }

  const isUp = priceDetails.diffPercent >= 0;
  const chatContext = `endeks:${currentFallback.code.toLowerCase()}`;

  // Predefined Quick-click technical questions for index
  const technicalQuestions = [
    `${priceDetails.code} endeksi destek ve direnç pivot noktaları nerede?`,
    `${priceDetails.code} RSI, MACD ve teknik osilatörler ne durumda?`,
    `${priceDetails.code} için son 50 günlük hareketli ortalama konumu nasıl?`,
    `${priceDetails.code} endeksinde Bollinger Bandı genişliği düzeltme sinyali veriyor mu?`,
    `${priceDetails.code} endeks trend gücü ve momentum analizi ne gösteriyor?`
  ];

  // Predefined Quick-click fundamental/sector questions for index
  const macroQuestions = [
    `${priceDetails.code} içindeki en yüksek ağırlığa sahip hisseler hangileri?`,
    `Sanayi ve Bankacılık rasyoları endeks üzerinde nasıl bir korelasyona sahip?`,
    `Yabancı saklama oranlarındaki değişimlerin endekse yansıması nasıl olur?`,
    `${priceDetails.code}'de çarpan bazında ucuz kalan sektörler hangileri?`,
    `Global enflasyon ve para politikası gelişmelerinin endekse etkisi nasıl olur?`
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">
      
      {/* SECTION A: Asset Heading Block (Fixed/Always Visible) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
        
        {/* Left Info Area */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-xs tracking-tight shrink-0">
            {priceDetails.code}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Endeksler</span>
            </div>
            <div className="flex items-center gap-2 mt-1 min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none truncate">{priceDetails.name}</h1>
              {/* Star Watchlist Action Button */}
              <button
                onClick={toggleWatchlist}
                className={`p-1 bg-transparent border-none shadow-none text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-colors ${
                  isStarred ? "text-[#FFD700] hover:text-[#FFC700]" : ""
                }`}
                title={isStarred ? "Takip Listesinden Çıkar" : "Takip Listeme Ekle"}
              >
                <Star size={20} fill={isStarred ? "currentColor" : "none"} strokeWidth={isStarred ? 1.5 : 2} />
              </button>
            </div>
          </div>
        </div>

        {/* Value Area */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {priceDetails.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-base md:text-lg font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
              isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
            }`}>
              {isUp ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
              <span>{isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B: Asset Body Block */}
      <div className="space-y-6">
          
          {/* Historical Trend Chart */}
          <TradingViewChart symbol={priceDetails.code} lastPrice={priceDetails.price} />

          {/* AI summaries summary text */}
          {indexSummary && indexSummary.length > 0 && (
            <div className="border border-border/40 bg-muted/15 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Yapay Zeka Analiz Özeti</h3>
              </div>
              <div className="text-xs md:text-sm text-foreground/80 leading-relaxed space-y-2.5">
                {indexSummary.map((p, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                ))}
              </div>
            </div>
          )}

          {/* Dual Columns Grid: Technical Indicators & Constituents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: Technical Indicators card */}
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp size={12} />
                  </div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Sinyaller</h3>
                </div>

                {techSinyaller && (
                  <div className="overflow-hidden border border-border/40 rounded-xl mb-6 bg-muted/10 divide-y divide-border/30">
                    <div className="flex justify-between items-center p-3 text-xs">
                      <span className="text-muted-foreground font-medium">RSI (14) Durumu</span>
                      <span className="font-semibold text-foreground">{techSinyaller.rsi}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 text-xs">
                      <span className="text-muted-foreground font-medium">MACD Trend</span>
                      <span className="font-semibold text-foreground">{techSinyaller.macd}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 text-xs">
                      <span className="text-muted-foreground font-medium">Bollinger Bands Konumu</span>
                      <span className="font-semibold text-foreground">{techSinyaller.bollinger}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 text-xs">
                      <span className="text-muted-foreground font-medium">Kritik Destek Seviyesi</span>
                      <span className="font-semibold text-foreground">
                        {Number(techSinyaller.destek).toLocaleString("tr-TR")} Puan
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 text-xs">
                      <span className="text-muted-foreground font-medium">Kritik Direnç Seviyesi</span>
                      <span className="font-semibold text-foreground">
                        {Number(techSinyaller.direnc).toLocaleString("tr-TR")} Puan
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5 Technical Questions */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                  <HelpCircle size={12} />
                  <span>Endeks Teknik Soruları</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {technicalQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        if (window.innerWidth < 1024) {
                          window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                        }
                        await sendMessage(q, chatContext);
                      }}
                      className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Constituents & Weights card */}
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Globe size={12} />
                  </div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Endeks Bileşenleri</h3>
                </div>

                {/* constituents list table with nested link navigation */}
                <div className="overflow-hidden border border-border/40 rounded-xl mb-6 bg-muted/10">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-muted/35 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider border-b border-border/45">
                        <th className="p-3">Hisse</th>
                        <th className="p-3">Son Fiyat</th>
                        <th className="p-3 text-right">Değişim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {priceDetails.components.map((comp) => {
                        const compUp = comp.diff >= 0;
                        return (
                          <tr 
                            key={comp.code}
                            onClick={() => navigate({ to: `/panel/sirketler/${comp.code.toLowerCase()}` as any })}
                            className="group hover:bg-muted/40 cursor-pointer transition-colors"
                          >
                            <td className="p-3 flex items-center gap-2 min-w-0">
                              {companyLogos[comp.code as keyof typeof companyLogos] ? (
                                <img src={`/logos/${companyLogos[comp.code as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                              ) : null}
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{comp.code}</span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{comp.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-foreground">
                              {comp.price.toFixed(2)} ₺
                            </td>
                            <td className="p-3 text-right">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                compUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                              }`}>
                                {compUp ? '+' : ''}{comp.diff.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5 Macro/Constituents suggested questions */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                  <Compass size={12} />
                  <span>Bileşen ve Sektör Soruları</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {macroQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        if (window.innerWidth < 1024) {
                          window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                        }
                        await sendMessage(q, chatContext);
                      }}
                      className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
  )
}
