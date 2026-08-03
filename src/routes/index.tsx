import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  ArrowDown, 
  ArrowUp,
  Blocks,
  ChartPie,
  Factory,
  MessageCircle,
  Settings2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useAuth } from '../hooks/useAuth'
import { useSectorGroups } from '../lib/useCompData'
import { groupKeyToDisplayName, groupKeyToSlug } from '../constants/sectorGroups'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'

import { useUIStore } from '../store/ui'
import { useIndices } from '../lib/useMarketData'
import { getIndexSlug } from '../constants/bistIndices'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { user, loading: sessionLoading, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const navigate = useNavigate()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  const { data: sectorGroupsData } = useSectorGroups()
  const { data: indicesData } = useIndices()
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnMouseEnter: true })])

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full relative">
      
      {/* Left: Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-4 scroll-smooth">
          
          {/* Hero */}
          <section className="relative w-full pt-16 pb-10 md:pt-20 md:pb-12 px-6 flex flex-col items-center text-center overflow-hidden">
            {/* Yumuşak renk geçişleri */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />

            {/* Borsa şebeke (grid) deseni */}
            <div
              className="absolute inset-0 -z-10 opacity-[0.35] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]"
              style={{
                backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />

            {/* Dekoratif değer çizgisi */}
            <svg className="absolute inset-x-0 top-6 -z-10 w-full pointer-events-none opacity-40" height="40" viewBox="0 0 1200 40" fill="none" preserveAspectRatio="none">
              <path d="M0 30 L100 20 L180 26 L260 12 L360 22 L460 10 L560 18 L680 8 L780 16 L880 6 L980 14 L1100 24 L1200 14" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M0 34 L120 28 L220 34 L320 20 L430 30 L540 16 L640 24 L760 14 L860 24 L980 12 L1100 20 L1200 16" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Mevcut parıltı blobu */}
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
            {indicesData ? (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3">
                  {['XU100', 'XU030', 'XU050', 'XBANK', 'XUSIN', 'XYLDZ', 'XUMAL', 'XHARZ', 'XGMYO', 'XKOBI'].map((code) => {
                    const idx = indicesData.find(i => i.code === code)
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
            ) : (
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-0 flex-[0_0_auto] w-[160px] rounded-2xl border border-border/20 p-4 animate-pulse">
                    <div className="h-3 w-12 rounded bg-muted mb-3" />
                    <div className="h-6 w-20 rounded bg-muted mb-2" />
                    <div className="h-4 w-14 rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Hero2 - CTA */}
          <section className="relative w-full py-16 px-6 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Borsanın röntgenini çekin
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
                Borsa İstanbul uzmanı tek yapay zekanın yeteneklerini ücretsiz keşfedin.
              </p>

              <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2">
                {[
                  { icon: Settings2, title: 'Teknik Analiz', description: 'Grafikler, indikatörler ve işlem hacmi ile derinlemesine teknik inceleme.' },
                  { icon: ChartPie, title: 'Temel Analiz', description: 'Finansal tablolar, rasyolar ve nakit akışı ile şirket değerleme.' },
                  { icon: Blocks, title: 'Sektör İnceleme', description: 'Sektör bazında büyüme, karlılık ve piyasa karşılaştırmaları.' },
                  { icon: MessageCircle, title: 'Şirket Karşılaştırma', description: 'Birden çok hisseyi yan yana getirerek performans ve rasyo analizi.' },
                ].map((feature) => (
                  <div key={feature.title} className="flex flex-col rounded-sm border p-6 text-left">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <feature.icon className="size-5" />
                    </div>
                    <span className="font-medium text-lg">{feature.title}</span>
                    <p className="mt-1 text-[15px] text-foreground/80">{feature.description}</p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Sektörler */}
          <section className="px-4 md:px-6 py-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Factory size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Sektörler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(sectorGroupsData?.groups || []).sort((a, b) => (b.count || 0) - (a.count || 0)).map(group => {
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

          {/* Footer - Kurumsal */}
          <footer className="px-4 md:px-6 py-10 mt-8 border-t border-border/50">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-foreground">JetBorsa</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BIST uzmanı yapay zekâ destekli finansal analiz platformu.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <Link to="/kurumsal/hakkimizda" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Hakkımızda
                </Link>
                <Link to="/kurumsal/iletisim" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  İletişim
                </Link>
                <Link to="/nasil-calisir" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Nasıl Çalışır
                </Link>
                <Link to="/kurumsal/insan-kaynaklari" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Kariyer
                </Link>
                <Link to="/kurumsal/sss" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  SSS
                </Link>
                <Link to="/kurumsal/kvkk" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  KVKK
                </Link>
                <Link to="/kurumsal/cerez-politikasi" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Çerez Politikası
                </Link>
                <Link to="/kurumsal/yasal-uyari" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Yasal Uyarı
                </Link>
                <Link to="/kurumsal/geri-bildirim" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Geri Bildirim
                </Link>
                <Link to="/kurumsal/bilgi-toplumu-hizmetleri" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Bilgi Toplumu Hizmetleri
                </Link>
                <Link to="/kurumsal/reklam-isbirligi" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Reklam İşbirliği
                </Link>
                <Link to="/kurumsal/nasil-kullanilir" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Nasıl Kullanılır
                </Link>
              </div>
            </div>
            <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/60">
                © 2026 JetBorsa. Tüm hakları saklıdır.
              </span>
              <Link to="/kurumsal" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors">
                Kurumsal
              </Link>
            </div>
          </footer>

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
