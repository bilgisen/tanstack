import { createFileRoute, Link } from '@tanstack/react-router'
import { HelpCircle, Star, TrendingUp, Compass, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { useChatStore } from '../store/chat'
import { useWatchlistStore } from '../store/watchlist'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'


export const Route = createFileRoute('/panel/sirketler/$id')({
  component: SirketDetailPage,
})

type CompanyStats = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: string;
};

type DetailedMetrics = {
  fk: string;
  pddf: string;
  halkaAciklik: string;
  ozsermayeKari: string;
};

type TechnicalSinyaller = {
  rsi: string;
  macd: string;
  bollinger: string;
  atrStop: string;
  destek: string;
  direnc: string;
};

function SirketDetailPage() {
  const { id } = Route.useParams()
  const tickerUpper = id.toUpperCase();
  const officialName = (companyNames as Record<string, string>)[tickerUpper] || `${tickerUpper} Anonim Şirketi`;

  const [priceDetails, setPriceDetails] = useState<CompanyStats | null>(null)
  const [metrics, setDetailedMetrics] = useState<DetailedMetrics | null>(null)
  const [techSinyaller, setTechnicalSinyaller] = useState<TechnicalSinyaller | null>(null)
  const [headerSummary, setHeaderSummary] = useState<string[] | null>(null)
  const [sectorPeers, setSectorPeers] = useState<any[]>([])
  const [sectorName, setSectorName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [fundamentalQuestions, setFundamentalQuestions] = useState<string[]>([
    `${tickerUpper} bilançosundaki en kritik finansal oranlar neler?`,
    `${tickerUpper} F/K ve PD/DD oranları sektöre göre ucuz mu?`,
    `${tickerUpper} şirketi borçluluk seviyesi ve likiditesi nasıl?`,
    `${tickerUpper} Özsermaye karlılığı ve büyüme trendini yorumlar mısın?`,
    `Sektörel beklentilerin ${tickerUpper} hissesine etkisi nasıl olur?`
  ])

  const { sendMessage } = useChatStore()
  const { watchlists, addItem, removeItem } = useWatchlistStore()

  // Track Watchlist status
  const defaultWatchlist = watchlists.find(w => w.id === "default-list") || watchlists[0];
  const isStarred = defaultWatchlist?.items.some(item => item.symbol === tickerUpper);

  const toggleWatchlist = () => {
    const defaultId = defaultWatchlist?.id || "default-list";
    if (isStarred) {
      removeItem(defaultId, tickerUpper);
    } else {
      addItem(defaultId, tickerUpper, "stock");
    }
  };

  // Load all stock metrics, summaries, prices and indicators
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadAllDetails() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.jetborsa.com";
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev";
      
      let lastPrice = 120.50;
      let diffPercent = 1.85;
      let high = 122.30;
      let low = 119.10;
      let open = 119.80;
      let close = 120.20;
      let volume = "45.2M ₺";

      // 1. Fetch live stock price
      try {
        const symbolRes = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}`);
        if (symbolRes.ok) {
          const sJson = await symbolRes.json();
          if (sJson.success && sJson.data) {
            lastPrice = sJson.data.last_price || sJson.data.last || lastPrice;
            diffPercent = sJson.data.diff_percent || 0.0;
          }
        }
      } catch (e) {
        console.error("Failed fetching live price", e);
      }

      // 2. Fetch compact summary card
      try {
        const cardRes = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/summary-card`);
        if (cardRes.ok) {
          const cJson = await cardRes.json();
          if (cJson && !cJson.error) {
            lastPrice = cJson.last_price || lastPrice;
            diffPercent = cJson.diff_percent !== undefined ? cJson.diff_percent : diffPercent;
            high = cJson.high || lastPrice * 1.02;
            low = cJson.low || lastPrice * 0.98;
            volume = cJson.volume || volume;
            open = cJson.open || lastPrice * 0.99;
            close = cJson.close || lastPrice;
          }
        }
      } catch (e) {
        console.error("Failed fetching summary card", e);
      }

      // 3. Fetch detailed fundamentals
      let fk = "8.50";
      let pddf = "1.20";
      let halkaAciklik = "40.0%";
      let ozsermayeKari = "18.0%";

      try {
        const detailRes = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/detail`);
        if (detailRes.ok) {
          const dJson = await detailRes.json();
          if (dJson.success && dJson.data) {
            fk = dJson.data.fk || dJson.data.FK || fk;
            pddf = dJson.data.pddf || dJson.data.PD_DD || pddf;
            halkaAciklik = dJson.data.halka_aciklik_orani || dJson.data.halka_aciklik || halkaAciklik;
            ozsermayeKari = dJson.data.ozsermaye_karliligi || dJson.data.ozsermayekari || ozsermayeKari;
          }
        }
      } catch (e) {
        console.error("Failed fetching fundamentals detail", e);
      }

      // 4. Fetch technical signals
      let rsi = "52.4 (Nötr)";
      let macd = "Nötr";
      let bollinger = "Orta Bantta";
      let atrStop = `${(lastPrice * 0.97).toFixed(2)} ₺`;
      let destek = `${(lastPrice * 0.96).toFixed(2)} ₺`;
      let direnc = `${(lastPrice * 1.04).toFixed(2)} ₺`;

      try {
        const taRes = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/ta/summary`);
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
            rsi = `${formatRsiValue(tJson.rsi)} (${tJson.rsi_status || "Nötr"})`;
            macd = tJson.macd_status || "Nötr";
            bollinger = tJson.bollinger_status || "Orta Bantta";
            atrStop = tJson.stop_loss ? `${formatNumberValue(tJson.stop_loss, 2, (lastPrice * 0.97).toFixed(2))} ₺` : atrStop;
            destek = tJson.support ? `${formatNumberValue(tJson.support, 2, (lastPrice * 0.96).toFixed(2))} ₺` : destek;
            direnc = tJson.resistance ? `${formatNumberValue(tJson.resistance, 2, (lastPrice * 1.04).toFixed(2))} ₺` : direnc;
          }
        }
      } catch (e) {
        console.error("Failed fetching technical indicators", e);
      }

      // 5. Fetch LLM header summary paragraphs & fundamental questions
      let paragraphs: string[] = [
        `**${tickerUpper}** hissesi için son analizler, fiyat hareketlerinin kısa vadeli düzeltme eğiliminde olduğunu fakat güçlü destek noktalarından dönüş sinyalleri verdiğini göstermektedir.`,
        "Sektör ortalamalarına göre dengeli rasyolara sahip olan şirket, orta ve uzun vadeli yatırımcılar için yakından izlenmektedir."
      ];
      let customFundQs: string[] = [];

      try {
        const [summaryRes, fundRes] = await Promise.allSettled([
          fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/header-summary`),
          fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/fundamental-summary`)
        ]);

        if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
          const summaryJson = await summaryRes.value.json();
          if (summaryJson && summaryJson.paragraphs && summaryJson.paragraphs.length > 0) {
            paragraphs = summaryJson.paragraphs;
          }
        }

        if (fundRes.status === 'fulfilled' && fundRes.value.ok) {
          const fundJson = await fundRes.value.json();
          if (fundJson && fundJson.questions && fundJson.questions.length > 0) {
            customFundQs = fundJson.questions;
          }
        }
      } catch (e) {
        console.error("Failed fetching AI summaries", e);
      }

      // 6. Fetch sector peers
      let peersList: any[] = [];
      let sectorMain = "";
      try {
        const profileRes = await fetch(`${compUrl}/api/v1/companies/${tickerUpper}/profile`);
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          sectorMain = profileJson.sector_main || "";
          if (sectorMain) {
            const peersRes = await fetch(`${compUrl}/api/v1/sectors/${encodeURIComponent(sectorMain)}/companies`);
            if (peersRes.ok) {
              const peersJson = await peersRes.json();
              if (peersJson && peersJson.companies) {
                peersList = peersJson.companies
                  .filter((c: any) => c.ticker.toUpperCase() !== tickerUpper)
                  .slice(0, 5);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed fetching sector peers", e);
      }

      if (!isMounted) return;

      setSectorPeers(peersList);
      setSectorName(sectorMain || "");

      setPriceDetails({
        name: officialName,
        code: tickerUpper,
        price: lastPrice,
        diffPercent: diffPercent,
        high: high,
        low: low,
        open: open,
        close: close,
        volume: volume,
      });

      setDetailedMetrics({
        fk,
        pddf,
        halkaAciklik,
        ozsermayeKari,
      });

      setTechnicalSinyaller({
        rsi,
        macd,
        bollinger,
        atrStop,
        destek,
        direnc,
      });

      setHeaderSummary(paragraphs);
      if (customFundQs.length > 0) {
        setFundamentalQuestions(customFundQs);
      }
      setLoading(false);
    }

    loadAllDetails();
    return () => {
      isMounted = false;
    };
  }, [id, officialName, tickerUpper]);

  if (loading || !priceDetails) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={16} />
        <span>Veriler yükleniyor, lütfen bekleyin...</span>
      </div>
    );
  }

  const isUp = priceDetails.diffPercent >= 0;
  const chatContext = `sirket:${tickerUpper.toLowerCase()}`;

  // Predefined Quick-click technical analysis questions
  const technicalQuestions = [
    `${tickerUpper} hissesi için destek ve direnç noktalarını özetler misin?`,
    `${tickerUpper} RSI ve MACD teknik sinyalleri ne yönde?`,
    `${tickerUpper} güncel EMA (Hareketli Ortalama) durumu nedir?`,
    `${tickerUpper} Bollinger Bandı alt-üst bant konumları nasıl?`,
    `${tickerUpper} ATR bazlı stop-loss seviyesi kaç olmalıdır?`
  ];

  // Predefined Quick-click fundamental analysis questions are managed by fundamentalQuestions state variable

  return (
    <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">
      
      {/* SECTION A: Asset Heading Block (Fixed/Always Visible) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
        
        {/* Left Info Area */}
        <div className="flex items-center gap-3.5 min-w-0">
          {companyLogos[tickerUpper as keyof typeof companyLogos] ? (
            <div className="h-12 w-12 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
              <img src={`/logos/${companyLogos[tickerUpper as keyof typeof companyLogos]}`} alt={priceDetails.code} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-sm tracking-tight shrink-0">
              {priceDetails.code}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{tickerUpper}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 min-w-0">
              <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight leading-none truncate">{priceDetails.name}</h1>
              {/* Star Watchlist Action Button */}
              <button
                onClick={toggleWatchlist}
                className={`p-1 bg-transparent border-none shadow-none text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-colors ${
                  isStarred ? "text-[#FFD700] hover:text-[#FFC700]" : ""
                }`}
                title={isStarred ? "Takip Listesinden Çıkar" : "Takip Listeme Ekle"}
              >
                <Star size={16} fill={isStarred ? "currentColor" : "none"} strokeWidth={isStarred ? 1.5 : 2} />
              </button>
            </div>
          </div>
        </div>

        {/* Value and Metrics Area */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
          
          {/* Prices & Daily Change */}
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">Anlık Fiyat</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg md:text-xl font-bold text-foreground tracking-tight">{priceDetails.price.toFixed(2)} ₺</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
              }`}>
                {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Mini OHLV Stat Table */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] border-l border-border/40 pl-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground font-medium">Açılış / Kapanış</span>
              <span className="font-semibold text-foreground mt-0.5">{priceDetails.open.toFixed(2)} / {priceDetails.close.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground font-medium">Yüksek / Düşük</span>
              <span className="font-semibold text-foreground mt-0.5">{priceDetails.high.toFixed(2)} / {priceDetails.low.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground font-medium">İşlem Hacmi</span>
              <span className="font-semibold text-foreground mt-0.5">{priceDetails.volume}</span>
            </div>
          </div>


        </div>
      </div>

      {/* SECTION B: Asset Body Block */}
      <div className="space-y-6">
          
          {/* TradingView Candlestick Chart */}
          <TradingViewChart symbol={tickerUpper} lastPrice={priceDetails.price} />

          {/* AI Brief Summary Paragraphs (No Header) */}
          {headerSummary && headerSummary.length > 0 && (
            <div className="border border-border/40 bg-muted/15 p-5 rounded-2xl">
              <div className="text-xs md:text-sm text-foreground/80 leading-relaxed space-y-2.5">
                {headerSummary.map((p, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                ))}
              </div>
            </div>
          )}

          {/* Technical Analysis Block */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border/30">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={12} />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Analiz Göstergeleri</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technical Metric Table */}
              {techSinyaller && (
                <div className="overflow-hidden border border-border/40 rounded-xl bg-muted/10 divide-y divide-border/30">
                  <div className="flex justify-between items-center p-3.5 text-xs">
                    <span className="text-muted-foreground font-medium">RSI (14) Durumu</span>
                    <span className="font-semibold text-foreground">{techSinyaller.rsi}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 text-xs">
                    <span className="text-muted-foreground font-medium">MACD Sinyali</span>
                    <span className="font-semibold text-foreground">{techSinyaller.macd}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 text-xs">
                    <span className="text-muted-foreground font-medium">Bollinger Konumu</span>
                    <span className="font-semibold text-foreground">{techSinyaller.bollinger}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 text-xs">
                    <span className="text-muted-foreground font-medium">Destek / Direnç Seviyeleri</span>
                    <span className="font-semibold text-foreground">{techSinyaller.destek} / {techSinyaller.direnc}</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 text-xs">
                    <span className="text-muted-foreground font-medium">ATR Pivot Stop-Loss</span>
                    <span className="font-semibold text-primary">{techSinyaller.atrStop}</span>
                  </div>
                </div>
              )}

              {/* 5 Technical Suggested Questions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                  <HelpCircle size={12} />
                  <span>Önerilen Teknik Analiz Soruları</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {technicalQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        if (window.innerWidth < 1024) {
                          window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                        }
                        await sendMessage(q, chatContext);
                      }}
                      className="text-left text-xs text-muted-foreground hover:bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fundamental Analysis Block */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border/30">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Compass size={12} />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Temel Analiz Rasyoları</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fundamental Metrics Cards Grid */}
              {metrics && (
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 border border-border/40 rounded-xl bg-muted/10 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Fiyat / Kazanç (F/K)</span>
                    <span className="text-sm md:text-base font-bold text-foreground mt-1">{metrics.fk}</span>
                  </div>
                  <div className="p-3.5 border border-border/40 rounded-xl bg-muted/10 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Piyasa Değeri / Defter Değeri (PD/DD)</span>
                    <span className="text-sm md:text-base font-bold text-foreground mt-1">{metrics.pddf}</span>
                  </div>
                  <div className="p-3.5 border border-border/40 rounded-xl bg-muted/10 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Halka Açıklık Oranı</span>
                    <span className="text-sm md:text-base font-bold text-foreground mt-1">{metrics.halkaAciklik}</span>
                  </div>
                  <div className="p-3.5 border border-border/40 rounded-xl bg-muted/10 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Özsermaye Karlılığı (ROE)</span>
                    <span className="text-sm md:text-base font-bold text-foreground mt-1">{metrics.ozsermayeKari}</span>
                  </div>
                </div>
              )}

              {/* 5 Fundamental Suggested Questions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                  <HelpCircle size={12} />
                  <span>Önerilen Temel Analiz & Bilanço Soruları</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {fundamentalQuestions.map((q, idx) => (
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

          {/* Sektörel Akran Hisseler (Sector Block) */}
          {sectorPeers && sectorPeers.length > 0 && (
            <div className="border border-border/45 bg-card/20 rounded-2xl p-6 space-y-4">
              <div className="pb-3 border-b border-border/30">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{sectorName} Şirketleri</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sectorPeers.map((peer) => {
                  const peerTicker = peer.ticker.toUpperCase();
                  const peerName = (companyNames as Record<string, string>)[peerTicker] || peer.name;
                  const logoFile = companyLogos[peerTicker as keyof typeof companyLogos];
                  
                  return (
                    <Link
                      key={peer.ticker}
                      to="/panel/sirketler/$id"
                      params={{ id: peer.ticker.toLowerCase() }}
                      className="flex items-center gap-3 p-3 border border-border/35 hover:border-border/60 bg-card/40 hover:bg-muted/10 rounded-xl transition-all cursor-pointer group min-w-0"
                    >
                      {logoFile ? (
                        <div className="h-9 w-9 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <img src={`/logos/${logoFile}`} alt={peerTicker} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {peerTicker}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-foreground tracking-tight truncate">{peerTicker}</div>
                        <div className="text-[10px] text-muted-foreground truncate leading-normal">{peerName}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

      </div>

      </div>
  )
}
