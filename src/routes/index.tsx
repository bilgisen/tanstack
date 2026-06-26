import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUpRight
} from 'lucide-react'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

type IndexDisplay = {
  id: string;
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  sparkline: number[];
}

function LandingPage() {
  const { user, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)
  
  const [indexData, setIndexDisplay] = useState<IndexDisplay[]>([
    { id: 'bist100', name: "BIST 100", code: "XU100", price: 10240.20, diffPercent: 1.15, sparkline: [10120, 10150, 10110, 10190, 10220, 10210, 10240.20] },
    { id: 'bist30', name: "BIST 30", code: "XU030", price: 11250.40, diffPercent: 1.45, sparkline: [11080, 11110, 11150, 11130, 11190, 11220, 11250.40] },
    { id: 'bist500', name: "BIST 500", code: "XU500", price: 12540.80, diffPercent: 0.95, sparkline: [12420, 12450, 12410, 12480, 12510, 12500, 12540.80] },
  ])

  useEffect(() => {
    async function fetchIndices() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      try {
        const res = await fetch(`${apiUrl}/api/market/summary`)
        if (res.ok) {
          const json = await res.json()
          if (json && Array.isArray(json.data)) {
            setIndexDisplay(prev => prev.map(item => {
              const live = json.data.find((idx: any) => idx.code.toUpperCase() === item.code);
              if (live) {
                const currentPrice = live.last_price || item.price;
                const diff = live.diff_percent !== undefined ? live.diff_percent : item.diffPercent;
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
        }
      } catch (e) {
        console.error("Failed fetching indices:", e)
      }
    }
    fetchIndices()
  }, [])

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full overflow-hidden">
      
      {/* Left: Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-4 scroll-smooth">
          
          {/* Hero */}
          <section className="relative w-full pt-16 pb-12 md:pt-24 md:pb-16 px-6 flex flex-col items-center text-center overflow-hidden">
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

          {/* Index Cards */}
          <section className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-primary" />
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2.5">
                <Activity size={12} className="text-emerald-500" />
                <span>Bugün Borsa</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {indexData.map((idx) => {
                const isUp = idx.diffPercent >= 0;
                const routeTarget = user ? `/panel/endeksler/${idx.id}` : `/endeksler`;
                
                return (
                  <Link
                    key={idx.id}
                    to={routeTarget}
                    className="group border border-border/40 hover:border-border/70 rounded-2xl p-4 md:p-5 bg-card/15 hover:bg-card/25 shadow-3xs transition-all duration-300 flex flex-col relative overflow-hidden"
                  >
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
          </section>

          {/* Quick Actions for logged in users */}
          {user && (
            <section className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/endeksler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <Activity size={18} className="text-primary" />
                  <div>
                    <span className="text-xs font-bold block">Endeksler</span>
                    <span className="text-[10px] text-muted-foreground">BIST endeksleri</span>
                  </div>
                </Link>
                <Link to="/sektorler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <Activity size={18} className="text-primary" />
                  <div>
                    <span className="text-xs font-bold block">Sektörler</span>
                    <span className="text-[10px] text-muted-foreground">Sektör analizi</span>
                  </div>
                </Link>
                <Link to="/sirketler" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <Activity size={18} className="text-primary" />
                  <div>
                    <span className="text-xs font-bold block">Şirketler</span>
                    <span className="text-[10px] text-muted-foreground">Hisse senetleri</span>
                  </div>
                </Link>
                <Link to="/takip-listesi" className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 bg-card/15 hover:bg-primary/5 transition-all group">
                  <Sparkles size={18} className="text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Takip Listem</span>
                    <span className="text-[10px] text-muted-foreground">Portföyüm</span>
                  </div>
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
