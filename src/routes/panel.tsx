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
      {/* Mobile Sidebar Backdrop Overlay */}
      {isLeftSidebarExpanded && (
        <div 
          onClick={toggleLeftSidebarExpanded}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden cursor-pointer animate-in fade-in duration-200"
        />
      )}

      {/* Sol Collapsible Sidebar */}
      <LeftSidebar />

      {/* Ana Kolon */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-background">
        
        {/* Revolut-style Mobile Header */}
        <header className="lg:hidden h-16 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-35 select-none border-b border-border/50">
          <button
            onClick={toggleLeftSidebarExpanded}
            className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-all cursor-pointer"
          >
            <PanelLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Logo size={16} />
            </div>
            <span className="font-display font-medium tracking-tight">hissepro</span>
          </div>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        {/* Scrollable Sub-Page area (Outlet) OR Active Chat Stream Messages */}
        <main 
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto bg-background px-6 md:px-8 py-6 custom-scrollbar min-w-0 relative z-10 pb-40 scroll-smooth"
        >
          {messages.length > 0 && !(pathname.includes('/sirketler/') || pathname.includes('/endeksler/')) ? (
            <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-6 py-4 text-[15px] max-w-[90%] sm:max-w-[80%] leading-relaxed rounded-[20px] shadow-sm ${
                    msg.role === "user"
                      ? "chat-question-bubble font-medium rounded-tr-sm"
                      : "chat-response-bubble rounded-tl-sm w-full"
                  }`}>
                    <MarkdownRenderer text={msg.text} isAssistant={msg.role === "assistant"} context={msg.context || context} suggestions={msg.suggestions} widget={msg.widget} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="chat-response-bubble text-muted-foreground text-sm rounded-[20px] rounded-tl-sm px-6 py-4 flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    Analiz ediliyor...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full">
              <Outlet />
            </div>
          )}
        </main>

        {/* Floating Revolut-style Chatbot Container */}
        <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
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

