import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import useEmblaCarousel from 'embla-carousel-react'
import { 
  Sparkles, 
  ArrowUp,
  ArrowDown,
  Factory,
  ChevronRight,
  Star,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

type IndexDisplay = {
  id: string;
  name: string;
  code: string;
  price: number;
  diffPercent: number;
}

type StockRow = {
  ticker: string;
  name: string;
  price: number;
  diffPercent: number;
  volume?: number;
}

function LandingPage() {
  const { user, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const navigate = useNavigate()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)
  
  const [emblaRef] = useEmblaCarousel(
    { align: 'start', slidesToScroll: 1 }
  )

  const [indexData, setIndexDisplay] = useState<IndexDisplay[]>([
    { id: 'bist100', name: "BIST 100", code: "XU100", price: 10240.20, diffPercent: 1.15 },
    { id: 'bist30', name: "BIST 30", code: "XU030", price: 11250.40, diffPercent: 1.45 },
    { id: 'bist500', name: "BIST 500", code: "XU500", price: 12540.80, diffPercent: 0.95 },
  ])

  const [topGainers, setTopGainers] = useState<StockRow[]>([])
  const [sectors, setSectors] = useState<{ slug: string; name: string; companyCount: number }[]>([])

  useEffect(() => {
    async function fetchData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      
      // Fetch indices
      try {
        const res = await fetch(`${apiUrl}/api/market/summary`)
        if (res.ok) {
          const json = await res.json()
          if (json && Array.isArray(json.data)) {
            setIndexDisplay(prev => prev.map(item => {
              const live = json.data.find((idx: any) => idx.code.toUpperCase() === item.code);
              if (live) {
                return {
                  ...item,
                  price: Number((live.last_price || item.price).toFixed(2)),
                  diffPercent: Number((live.diff_percent !== undefined ? live.diff_percent : item.diffPercent).toFixed(2)),
                };
              }
              return item;
            }))
          }
        }
      } catch (e) {
        console.error("Failed fetching indices:", e)
      }

      // Fetch stocks
      try {
        const res = await fetch(`${apiUrl}/api/market/stocks`)
        if (res.ok) {
          const json = await res.json()
          if (json && Array.isArray(json.data)) {
            const allStocks: StockRow[] = json.data
              .filter((s: any) => s.code && s.last_price !== undefined)
              .map((s: any) => ({
                ticker: s.code.toUpperCase(),
                name: (companyNames as Record<string, string>)[s.code.toUpperCase()] || s.code.toUpperCase(),
                price: Number(s.last_price),
                diffPercent: Number(s.diff_percent || 0),
                volume: Number(s.volume || 0),
              }))

            // Top 10 gainers
            const gainers = [...allStocks]
              .sort((a, b) => b.diffPercent - a.diffPercent)
              .slice(0, 10)
            setTopGainers(gainers)
          }
        }
      } catch (e) {
        console.error("Failed fetching stocks:", e)
      }

      // Fetch sectors
      try {
        const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"
        const res = await fetch(`${compUrl}/api/v1/sectors`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.sectors) {
            const sectorList = data.sectors
              .filter((s: any) => s.name)
              .map((s: any) => ({
                slug: s.name.toLowerCase()
                  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                  .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, ''),
                name: s.name,
                companyCount: s.total_companies || s.active_companies || 0,
              }))
            setSectors(sectorList)
          }
        }
      } catch (e) {
        console.error("Failed fetching sectors:", e)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full overflow-hidden">
      
      {/* Left: Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-4 scroll-smooth">
          
          {/* Hero */}
          <section className="relative w-full pt-16 pb-10 md:pt-20 md:pb-12 px-6 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
            
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-6">
                <Sparkles size={12} />
                BIST Uzmanı Tek Yapay Zeka
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Akıllı Borsacı
              </h1>
              
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg sm:text-xl leading-relaxed">
                Borsayı derinlemesine ve jet hızında analiz edin.
              </p>

              {!user && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                    </svg>
                    <span>Google ile Bağlanın</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Index Cards Carousel - Autoplay + Loop */}
          <section className="px-4 md:px-6 py-4">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3">
                {[...indexData, ...indexData, ...indexData].map((idx, i) => {
                  const isUp = idx.diffPercent >= 0;
                  const routeTarget = `/endeksler/${idx.id}`;
                  
                  return (
                    <Link
                      key={`${idx.id}-${i}`}
                      to={routeTarget}
                      className="flex-none w-[200px] md:w-[240px] rounded-2xl p-4 bg-card/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-foreground truncate">{idx.name}</span>
                        <span className={`text-sm font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                          %{isUp ? '+' : ''}{idx.diffPercent.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground font-mono truncate">
                          {idx.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUp ? 'bg-emerald-500' : 'bg-destructive'}`}>
                          {isUp ? <ArrowUp size={16} className="text-white" /> : <ArrowDown size={16} className="text-white" />}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Günün Yıldızları */}
          <section className="px-4 md:px-6 py-4">
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star size={14} />
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Günün Yıldızları</h3>
              </div>
              <div className="divide-y divide-white/5">
                {topGainers.map((stock) => {
                  const logoFile = companyLogos[stock.ticker as keyof typeof companyLogos]
                  return (
                    <div
                      key={stock.ticker}
                      onClick={() => navigate({ to: `/sektorler/${tickerToSectorSlug[stock.ticker] || 'diger'}/${stock.ticker.toLowerCase()}` })}
                      className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {logoFile ? (
                          <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                            <img src={`/logos/${logoFile}`} alt={stock.ticker} className="h-full w-full object-cover p-0.5" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0 border border-primary/10">
                            {stock.ticker.slice(0, 2)}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {stock.ticker}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-base font-bold font-mono text-emerald-500">
                          +{stock.diffPercent.toFixed(2).replace('.', ',')}%
                        </span>
                        <span className="text-base font-semibold font-mono text-foreground">
                          ₺{stock.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {topGainers.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">Veriler yükleniyor...</div>
                )}
              </div>
            </div>
          </section>

          {/* Sektörler */}
          <section className="px-4 md:px-6 py-4">
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Factory size={14} />
                  </div>
                  <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Sektörler</h3>
                </div>
                <Link
                  to="/sektorler"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Tümünü Gör
                  <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {sectors.slice(0, 6).map((sector) => (
                  <Link
                    key={sector.slug}
                    to="/sektorler/$slug"
                    params={{ slug: sector.slug }}
                    className="group flex items-center justify-between border border-border/40 bg-muted/10 rounded-xl p-4 transition-all hover:border-primary/30 hover:bg-muted/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <Factory size={16} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{sector.name}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sector.companyCount} şirket</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
              {sectors.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Sektör verisi yükleniyor...</div>
              )}
            </div>
          </section>
        </div>

        {/* Mobile floating chat trigger */}
        <div className="lg:hidden absolute bottom-6 left-6 right-6 z-40 flex justify-center pointer-events-none">
          <div
            onClick={() => setIsChatSheetOpen(true)}
            className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-6 duration-500 cursor-pointer flex items-center px-6 py-2.5 justify-between"
          >
            <span className="text-muted-foreground/60 text-base truncate pr-4">Bir soru sorun...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 self-center">
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Chat Panel */}
      <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
        <ChatPanel context="global" placeholder="Borsa hakkında bir soru sorun..." user={user} />
      </div>

      {/* Mobile: Chat Sheet */}
      <ChatSheet
        isOpen={isChatSheetOpen}
        onClose={() => setIsChatSheetOpen(false)}
        context="global"
        placeholder="Borsa hakkında bir soru sorun..."
        user={user}
      />
    </div>
  )
}
