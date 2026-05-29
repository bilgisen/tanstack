import { createFileRoute, Outlet, useNavigate, useLocation, Link } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef } from 'react'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { useUIStore } from '../store/ui'
import { useChatStore } from '../store/chat'
import { PanelLeft, Loader2 } from 'lucide-react'
import { ChatPane } from '../components/dashboard/ChatPane'
import { MarkdownRenderer } from '../components/dashboard/MarkdownRenderer'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    isLeftSidebarExpanded, 
    toggleLeftSidebarExpanded,
  } = useUIStore()
  const { messages, isLoading } = useChatStore()
  const mainScrollRef = useRef<HTMLDivElement>(null)

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
      }
    }
    window.addEventListener('app-navigate', handleNavigate)
    return () => {
      window.removeEventListener('app-navigate', handleNavigate)
    }
  }, [navigate])

  // Scroll to bottom whenever messages or loading state change
  useEffect(() => {
    if (mainScrollRef.current) {
      // Immediate scroll
      mainScrollRef.current.scrollTop = mainScrollRef.current.scrollHeight;
      
      // Delayed scroll to account for async markdown HTML rendering & layout reflows
      const timer = setTimeout(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = mainScrollRef.current.scrollHeight;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading])

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
    <div className="flex-1 flex flex-row overflow-hidden relative bg-background font-sans h-full">
      {/* Mobile Sidebar Backdrop Overlay - Elevated z-index to z-45 */}
      {isLeftSidebarExpanded && (
        <div 
          onClick={toggleLeftSidebarExpanded}
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-45 lg:hidden cursor-pointer animate-in fade-in duration-200"
        />
      )}

      {/* Sol Collapsible Sidebar */}
      <LeftSidebar />

      {/* Ana Kolon */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-background">
        
        {/* Seamless Mobile Header / Topbar */}
        <header className="lg:hidden h-14 border-b border-border/40 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-35 select-none">
          <button
            onClick={toggleLeftSidebarExpanded}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
            title="Menüyü Göster"
          >
            <PanelLeft size={18} />
          </button>
          
          <Link 
            to="/panel" 
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 text-primary hover:bg-primary/15 transition-all shrink-0"
            title="HissePro Paneli"
          >
            <Logo size={18} className="shrink-0" />
          </Link>
          
          <div className="w-9 h-9" /> {/* Spacer to center title */}
        </header>

        {/* Scrollable Sub-Page area (Outlet) OR Active Chat Stream Messages */}
        <main 
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar min-w-0 relative z-10 pb-36 scroll-smooth"
        >
          {messages.length > 0 && !(pathname.includes('/sirketler/') || pathname.includes('/endeksler/')) ? (
            <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] sm:max-w-[75%] leading-relaxed ${
                    msg.role === "user"
                      ? "chat-question-bubble font-medium rounded-tr-sm shadow-sm"
                      : "bg-muted/40 text-foreground border border-border/40 rounded-tl-sm w-full"
                  }`}>
                    <MarkdownRenderer text={msg.text} isAssistant={msg.role === "assistant"} context={msg.context || context} suggestions={msg.suggestions} widget={msg.widget} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-muted/25 text-muted-foreground text-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    Yapay zeka analiz ediyor...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Outlet />
          )}
        </main>



        {/* Floating Glassmorphic Chatbot Container at the Bottom */}
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-3xl bg-card/75 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <ChatPane
              context={context}
              placeholder={placeholder}
              className="w-full border-none shadow-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
