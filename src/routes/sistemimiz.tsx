import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'
import { Hero2 } from '../components/home/Hero2'
import { HomeFooter } from '../components/home/HomeFooter'

export const Route = createFileRoute('/sistemimiz')({
  component: SistemimizPage,
})

function SistemimizPage() {
  const { user, loading: sessionLoading, login: handleLogin } = useAuth()
  const { isChatMaximized } = useUIStore()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full relative">

      {/* Left: Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-4 scroll-smooth">

          {/* Hero */}
          <section className="relative w-full aspect-square md:aspect-video px-6 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Video arka plan */}
            <video
              className="absolute inset-0 -z-30 h-full w-full object-cover pointer-events-none"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
            >
              <source src="https://videos.pexels.com/video-files/5226462/5226462-hd_1920_1080_30fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 -z-20 bg-black/55 pointer-events-none" />

            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest mb-6">
                <Sparkles size={12} />
                Sistemimiz
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white">
                Sistemimiz
              </h1>

              <p className="text-white/80 max-w-2xl mx-auto mb-8 text-xl sm:text-2xl leading-relaxed">
                Sezgilere değil, doğrulanmış verilere dayanan analiz sistemi.
              </p>

              {!user && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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

          {/* Hero2 - Yatırımlarınıza Sezgiler Değil Veriler */}
          <Hero2 />

          {/* Footer - Kurumsal */}
          <HomeFooter />

        </div>
      </div>

      {/* Desktop: Chat Panel */}
      <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
        <ChatPanel context="global" placeholder="Borsa hakkında bir soru sorun..." user={user} sessionLoading={sessionLoading} />
      </div>

      {/* Mobile floating chat trigger */}
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