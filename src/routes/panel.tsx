import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isChatMaximized } = useUIStore()

  const mainScrollRef = useRef<HTMLDivElement>(null)
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  // Public erişim: Auth kontrolü kaldırıldı
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate({ to: '/' })
  //   }
  // }, [user, loading, navigate])

  // Handle seamless cross-asset / panel navigation triggered by chatbot
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>
      if (customEvent.detail?.path) {
        navigate({ to: customEvent.detail.path })
        // Close mobile chat overlay if open
        setIsChatSheetOpen(false)
      }
    }
    const handleOpenMobileChat = () => {
      setIsChatSheetOpen(true)
    }
    window.addEventListener('app-navigate', handleNavigate)
    window.addEventListener('open-mobile-chat', handleOpenMobileChat)
    return () => {
      window.removeEventListener('app-navigate', handleNavigate)
      window.removeEventListener('open-mobile-chat', handleOpenMobileChat)
    }
  }, [navigate])

  // Scroll main container to bottom on routing or context change if required
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0
    }
  }, [location.pathname])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground animate-pulse font-sans">
        Yükleniyor...
      </div>
    )
  }

  // Public erişim: Artık login ekranı göstermiyor
  // if (!user) {
  //   return (
  //     <div className="flex flex-col h-screen items-center justify-center bg-background text-muted-foreground font-sans p-6 text-center max-w-sm mx-auto space-y-4 select-none">
  //       <Logo size={42} variant="icon" className="text-[#494fdf] animate-pulse" />
  //       <h4 className="text-base font-semibold text-foreground">Oturum Açmanız Gerekiyor</h4>
  //       <p className="text-xs text-muted-foreground leading-relaxed">
  //         Jetborsa analiz paneline ve asistan özelliklerine erişmek için lütfen giriş yapın veya ücretsiz üye olun.
  //       </p>
  //       <button
  //         onClick={handleLogin}
  //         className="px-5 py-2 rounded-full bg-primary text-white font-semibold hover:brightness-110 active:scale-95 transition-all text-xs cursor-pointer shadow-sm animate-in fade-in duration-300"
  //       >
  //         Giriş Yap
  //       </button>
  //     </div>
  //   )
  // }

  // Dynamic context for chatbot based on current path
  let context = 'global'
  let placeholder = 'Bir soru sorun...'

  const pathname = location.pathname.toLowerCase()
  if (pathname.includes('/endeksler/')) {
    const parts = pathname.split('/endeksler/')
    if (parts[1]) {
      const endeksId = parts[1]
      context = `endeks:${endeksId}`
      const indexName = endeksId === 'bist30' ? 'BIST 30' : endeksId === 'bist100' ? 'BIST 100' : endeksId === 'bistbanka' ? 'BIST Bankacılık' : endeksId.toUpperCase()
      placeholder = `${indexName} hakkında bir soru sorun...`
    }
  } else if (pathname.includes('/sirketler/')) {
    const parts = pathname.split('/sirketler/')
    if (parts[1]) {
      const ticker = parts[1].toUpperCase()
      context = `sirket:${ticker.toLowerCase()}`
      placeholder = `${ticker} hakkında bir soru sorun...`
    }
  } else if (pathname.includes('/takip-listesi')) {
    context = 'takip-listesi'
    placeholder = 'Takip listeniz hakkında bir soru sorun...'
  }

  return (
    <div className="w-full h-full flex flex-col bg-background font-sans overflow-hidden">
      
      {/* Remaining Layout: Body area (Sub-page content + Chat Panel) */}
      <div className="flex-1 flex flex-row min-w-0 h-full relative overflow-hidden bg-background">
        
        {/* Left Column: Sub-Page content (Outlet) */}
        <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-background ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
          
          {/* Scrollable Sub-Page area (Outlet) */}
          <main 
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto bg-background px-6 md:px-8 py-6 custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-12 scroll-smooth"
          >
            <div className="w-full">
              <Outlet />
            </div>
          </main>

          {/* Floating Chat Trigger Bar (Mobile only) */}
          <div className="lg:hidden absolute bottom-6 left-6 right-6 z-40 flex justify-center pointer-events-none">
            <div 
              onClick={() => setIsChatSheetOpen(true)}
              className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-6 duration-500 cursor-pointer flex items-center px-6 py-2.5 justify-between"
            >
              <span className="text-muted-foreground/60 text-sm truncate pr-4">{placeholder}</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 self-center">
                <Logo size={14} variant="icon" className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Right Column: Dedicated Fixed Chat Panel (40% or 100% maximized) */}
        <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
          <ChatPanel context={context} placeholder={placeholder} user={user} sessionLoading={loading} />
        </div>

      </div>

      {/* Mobile Chat Bottom Sheet */}
      <ChatSheet 
        isOpen={isChatSheetOpen} 
        onClose={() => setIsChatSheetOpen(false)} 
        context={context} 
        placeholder={placeholder}
        user={user}
        sessionLoading={loading}
      />
    </div>
  )
}
