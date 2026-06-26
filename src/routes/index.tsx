import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import useEmblaCarousel from 'embla-carousel-react'
import { 
  Sparkles, 
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'
import { Logo } from '../components/layout/Logo'
import companyLogos from '../constants/companyLogos.json'

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
}

function LandingPage() {
  const { user, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const navigate = useNavigate()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)
  
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const [indexData, setIndexDisplay] = useState<IndexDisplay[]>([
    { id: 'bist100', name: "BIST 100", code: "XU100", price: 10240.20, diffPercent: 1.15 },
    { id: 'bist30', name: "BIST 30", code: "XU030", price: 11250.40, diffPercent: 1.45 },
    { id: 'bist500', name: "BIST 500", code: "XU500", price: 12540.80, diffPercent: 0.95 },
  ])

  const [topGainers, setTopGainers] = useState<StockRow[]>([])

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

      // Fetch stocks for gainers
      try {
        const res = await fetch(`${apiUrl}/api/market/stocks`)
        if (res.ok) {
          const json = await res.json()
          if (json && Array.isArray(json.data)) {
            const stocks: StockRow[] = json.data
              .filter((s: any) => s.code && s.last_price !== undefined)
              .map((s: any) => ({
                ticker: s.code.toUpperCase(),
                name: s.name || s.code.toUpperCase(),
                price: Number(s.last_price),
                diffPercent: Number(s.diff_percent || 0),
              }))
              .sort((a: StockRow, b: StockRow) => b.diffPercent - a.diffPercent)
              .slice(0, 10)
            setTopGainers(stocks)
          }
        }
      } catch (e) {
        console.error("Failed fetching stocks:", e)
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
                Jet Hızında Analiz
              </h1>
              
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
                Endeksleri, sektörleri, şirketleri derinlemesine analiz edin.
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

          {/* Index Cards Carousel */}
          <section className="px-4 md:px-6 py-4">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3">
                {indexData.map((idx) => {
                  const isUp = idx.diffPercent >= 0;
                  const routeTarget = `/endeksler/${idx.id}`;
                  
                  return (
                    <Link
                      key={idx.id}
                      to={routeTarget}
                      className="flex-none w-[200px] md:w-[240px] rounded-2xl p-4 bg-card/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-foreground truncate">
                          {idx.name}
                        </span>
                        <span className={`text-sm font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                          %{isUp ? '+' : ''}{idx.diffPercent.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground font-mono truncate">
                          ₺{idx.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isUp ? 'bg-emerald-500' : 'bg-destructive'
                        }`}>
                          {isUp ? <ArrowUp size={16} className="text-white" /> : <ArrowDown size={16} className="text-white" />}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Yükselenler - Seamless List */}
          {topGainers.length > 0 && (
            <section className="px-4 md:px-6 py-4">
              <h2 className="text-lg font-bold text-foreground mb-3 px-1">Yükselenler</h2>
              
              <div className="divide-y divide-white/5">
                {topGainers.map((stock) => {
                  const logoFile = companyLogos[stock.ticker as keyof typeof companyLogos]
                  
                  return (
                    <div
                      key={stock.ticker}
                      onClick={() => navigate({ to: `/sirketler/$id`, params: { id: stock.ticker.toLowerCase() } })}
                      className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {logoFile ? (
                          <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
                            <img src={`/logos/${logoFile}`} alt={stock.ticker} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                            {stock.ticker.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {stock.ticker}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-sm font-bold font-mono text-emerald-500">
                          +{stock.diffPercent.toFixed(2).replace('.', ',')}%
                        </span>
                        <span className="text-sm font-semibold font-mono text-foreground">
                          ₺{stock.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Quick Actions for logged in users */}
          {user && (
            <section className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/endeksler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <span className="text-xs font-bold block">Endeksler</span>
                </Link>
                <Link to="/sektorler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <span className="text-xs font-bold block">Sektörler</span>
                </Link>
                <Link to="/sirketler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <span className="text-xs font-bold block">Şirketler</span>
                </Link>
                <Link to="/takip-listesi" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <span className="text-xs font-bold block">Takip Listem</span>
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Mobile floating chat trigger */}
        <div className="lg:hidden absolute bottom-6 left-6 right-6 z-40 flex justify-center pointer-events-none">
          <div
            onClick={() => setIsChatSheetOpen(true)}
            className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-6 duration-500 cursor-pointer flex items-center px-6 py-2.5 justify-between"
          >
            <span className="text-muted-foreground/60 text-sm truncate pr-4">Bir soru sorun...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 self-center">
              <Logo size={14} variant="icon" className="text-white" />
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
