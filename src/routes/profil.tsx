import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/layout/Logo'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'

export const Route = createFileRoute('/profil')({
  component: ProtectedProfileLayout,
})

function ProtectedProfileLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isChatMaximized } = useUIStore()

  const mainScrollRef = useRef<HTMLDivElement>(null)
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>
      if (customEvent.detail?.path) {
        navigate({ to: customEvent.detail.path })
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

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0
    }
  }, [location.pathname])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Logo size={42} variant="icon" className="animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const placeholder = 'Profiliniz hakkında bir soru sorun...'

  return (
    <div className="w-full h-full flex flex-col bg-background font-sans">
      <div className="flex-1 flex flex-row min-w-0 h-full relative bg-background">
        
        {/* Left Column: Profile content */}
        <div className={`flex-1 flex flex-col min-w-0 h-full relative bg-background ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
          <main 
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto bg-background px-6 md:px-8 py-6 custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-12 scroll-smooth"
          >
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Desktop Right Column: Chat Panel */}
        <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
          <ChatPanel context="profil" placeholder={placeholder} user={user} sessionLoading={loading} />
        </div>

      </div>

      {/* Floating Chat Trigger Bar (Mobile only) */}
      <div 
        className="md:hidden fixed left-4 right-4 z-40 flex justify-center pointer-events-none"
        style={{ 
          bottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 20px)' 
        }}
      >
        <div 
          onClick={() => setIsChatSheetOpen(true)}
          className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-6 duration-500 cursor-pointer flex items-center px-6 py-2.5 justify-between"
        >
          <span className="text-muted-foreground/60 text-sm truncate pr-4">{placeholder}</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 self-center">
            <ArrowUp size={14} strokeWidth={2.5} className="text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Chat Bottom Sheet */}
      <ChatSheet 
        isOpen={isChatSheetOpen} 
        onClose={() => setIsChatSheetOpen(false)} 
        context="profil" 
        placeholder={placeholder}
        user={user}
        sessionLoading={loading}
      />
    </div>
  )
}
