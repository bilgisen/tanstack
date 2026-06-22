import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { Topbar } from '../components/layout/Topbar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { ArrowUp } from 'lucide-react'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const mainScrollRef = useRef<HTMLDivElement>(null)
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

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

  if (!user) {
    return null
  }

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
    <div className="flex-1 flex flex-col overflow-hidden relative bg-background font-sans h-full">
      
      {/* Topbar Navigation */}
      <Topbar />

      {/* Remaining Layout: Body area (Sub-page content + Chat Panel) */}
      <div className="flex-1 flex flex-row min-w-0 min-h-0 relative overflow-hidden bg-background">
        
        {/* Left Column: Sub-Page content (Outlet) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden bg-background">
          
          {/* Scrollable Sub-Page area (Outlet) */}
          <main 
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto bg-background px-6 md:px-8 py-6 custom-scrollbar min-w-0 relative z-10 pb-24 lg:pb-12 scroll-smooth min-h-0"
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
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Right Column: Dedicated Fixed Chat Panel (40%) */}
        <div className="hidden lg:block lg:w-[380px] xl:w-[420px] h-full shrink-0">
          <ChatPanel context={context} placeholder={placeholder} />
        </div>

      </div>

      {/* RightSidebar (Detailed Stats Panel, slides in/out) */}
      <RightSidebar />

      {/* Mobile Chat Bottom Sheet */}
      <ChatSheet 
        isOpen={isChatSheetOpen} 
        onClose={() => setIsChatSheetOpen(false)} 
        context={context} 
        placeholder={placeholder} 
      />
    </div>
  )
}
