import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Sparkles, 
  ArrowUp,
  ArrowDown,
  Star,
  Factory,
  TrendingUp,
} from 'lucide-react'
import { useSectorGroups } from '../lib/useCompData'
import { groupKeyToSlug, groupKeyToDisplayName } from '../constants/sectorGroups'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'

import { useUIStore } from '../store/ui'
import companyLogos from '../constants/companyLogos.json'
import companyNames from '../constants/companyNames.json'
import { useMarketStocks, useIndices } from '../lib/useMarketData'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { getIndexName, getIndexSlug } from '../constants/bistIndices'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

type StockRow = {
  ticker: string;
  name: string;
  price: number;
  diffPercent: number;
  volume?: number;
}

function LandingPage() {
  const { user, loading: sessionLoading, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const navigate = useNavigate()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)
  
  const { data: stocksData, isLoading: stocksLoading, isError: stocksError, error: stocksErrorObj } = useMarketStocks()
  const { data: sectorGroupsData } = useSectorGroups()
  const { data: indicesData } = useIndices()
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnMouseEnter: true })])

  const [topGainers, setTopGainers] = useState<StockRow[]>([])
  
  useEffect(() => {
    if (stocksData) {
      const allStocks: StockRow[] = stocksData
        .filter((s: any) => s.code && s.last_price !== undefined)
        .map((s: any) => ({
          ticker: s.code.toUpperCase(),
          name: (companyNames as Record<string, string>)[s.code.toUpperCase()] || s.code.toUpperCase(),
          price: Number(s.last_price),
          diffPercent: Number(s.diff_percent || 0),
          volume: Number(s.volume || 0),
        }))
      const gainers = [...allStocks].sort((a, b) => b.diffPercent - a.diffPercent).slice(0, 10)
      setTopGainers(gainers)
    }
  }, [stocksData])

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full relative">
      
      {/* Left: Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
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



          {/* Endeksler Carousel */}
          <section className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Endeksler</h3>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3">
                {['XU100', 'XU030', 'XU050', 'XBANK', 'XUSIN', 'XYLDZ', 'XUMAL', 'XHARZ', 'XGMYO', 'XKOBI'].map((code) => {
                  const idx = (indicesData || []).find((i: any) => i.code === code)
                  if (!idx) return null
                  const isUp = (idx.diff_percent ?? 0) >= 0
                  return (
                    <div
                      key={idx.code}
                      onClick={() => navigate({ to: `/endeksler/${getIndexSlug(idx.code)}` })}
                      className="min-w-0 flex-[0_0_auto] w-[160px] rounded-2xl border border-border/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors shrink-0"
                    >
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{idx.code}</div>
                      <div className="text-lg font-bold font-mono tabular-nums text-foreground">
                        {Number(idx.last_price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 font-bold text-sm ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                        {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {isUp ? '+' : ''}{Number(idx.diff_percent || 0).toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Günün Yıldızları */}
          <section className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2.5 mb-4">
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
                    onClick={() => navigate({ to: `/hisse/${stock.ticker.toLowerCase()}` })}
                    className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {logoFile ? (
                        <div className="h-8 w-8 rounded-md bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                          <img src={`/logos/${logoFile}`} alt={stock.ticker} className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/10">
                          {stock.ticker.slice(0, 2)}
                        </div>
                      )}
                      <div className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {stock.ticker}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-base font-bold font-mono text-emerald-500">
                        +{stock.diffPercent.toFixed(2).replace('.', ',')}%
                      </span>
                      <span className="text-base font-semibold font-mono text-foreground">
                        {stock.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )
              })}
              {stocksError && (
                <div className="py-8 text-center text-sm text-destructive/80">Veri alınamadı. Lütfen sayfayı yenileyin.</div>
              )}
              {stocksLoading && !stocksError && topGainers.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Veriler yükleniyor...</div>
              )}
              {!stocksLoading && !stocksError && topGainers.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Bugün için veri bulunamadı.</div>
              )}
            </div>
          </section>

          {/* Hero2 - CTA */}
          {!sessionLoading && !user && (
            <section className="relative w-full py-16 px-6 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Borsanın röntgenini çekin
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6 text-lg leading-relaxed">
                  Borsa İstanbul uzmanı tek yapay zekanın yeteneklerini ücretsiz keşfedin.
                </p>
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
                    <span>Google'la bağlan</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  30 gün ücretsiz kullanın. Kredi kartı gerekmez.
                </p>
              </div>
            </section>
          )}

          {/* Sektörler */}
          <section className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Factory size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Sektörler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(sectorGroupsData?.groups || []).sort((a: any, b: any) => (b.count || 0) - (a.count || 0)).map((group: any) => {
                const slug = groupKeyToSlug(group.key)
                return (
                  <Link
                    key={group.key}
                    to="/sektorler/$slug"
                    params={{ slug }}
                    className="flex items-center justify-between px-1 py-2.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Factory size={13} />
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {groupKeyToDisplayName(group.key) || group.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{group.count || '—'}</span>
                  </Link>
                )
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Desktop: Chat Panel */}
      <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
        <ChatPanel context="global" placeholder="Borsa hakkında bir soru sorun..." user={user} sessionLoading={sessionLoading} />
      </div>

      {/* Mobile floating chat trigger - MOVED OUTSIDE overflow containers */}
      <div 
        className="lg:hidden fixed left-4 right-4 z-40 flex justify-center pointer-events-none"
        style={{ 
          bottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 20px)' 
        }}
      >
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

      {/* Mobile: Chat Sheet */}
      <ChatSheet
        isOpen={isChatSheetOpen}
        onClose={() => setIsChatSheetOpen(false)}
        context="global"
        placeholder="Borsa hakkında bir soru sorun..."
        user={user}
        sessionLoading={sessionLoading}
      />
    </div>
  )
}
