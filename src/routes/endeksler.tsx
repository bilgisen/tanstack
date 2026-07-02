import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ChatSheet } from '../components/chat/ChatSheet'
import { useUIStore } from '../store/ui'
import { ArrowUp } from 'lucide-react'

export const Route = createFileRoute('/endeksler')({
  component: EndekslerLayout,
})

function EndekslerLayout() {
  const location = useLocation()
  const { isChatMaximized } = useUIStore()
  const mainScrollRef = useRef<HTMLDivElement>(null)
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  useEffect(() => {
    const handleOpenMobileChat = () => setIsChatSheetOpen(true)
    window.addEventListener('open-mobile-chat', handleOpenMobileChat)
    return () => window.removeEventListener('open-mobile-chat', handleOpenMobileChat)
  }, [])

  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0
  }, [location.pathname])

  const pathname = location.pathname.toLowerCase()
  let context = 'endeksler'
  let placeholder = 'Endeksler hakkında bir soru sorun...'

  if (pathname.includes('/endeksler/')) {
    const parts = pathname.split('/endeksler/')
    if (parts[1]) {
      const endeksId = parts[1]
      context = `endeks:${endeksId}`
      const indexName = endeksId === 'bist30' ? 'BIST 30' : endeksId === 'bist100' ? 'BIST 100' : endeksId === 'bistbanka' ? 'BIST Bankacılık' : endeksId.toUpperCase()
      placeholder = `${indexName} hakkında bir soru sorun...`
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-background font-sans">
      <div className="flex-1 flex flex-row min-w-0 h-full relative bg-background">
        
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

        <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
          <ChatPanel context={context} placeholder={placeholder} />
        </div>
      </div>

      {/* Mobile floating chat trigger - MOVED OUTSIDE overflow containers */}
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

      <ChatSheet 
        isOpen={isChatSheetOpen} 
        onClose={() => setIsChatSheetOpen(false)} 
        context={context} 
        placeholder={placeholder}
      />
    </div>
  )
}
