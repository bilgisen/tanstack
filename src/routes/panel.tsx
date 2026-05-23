import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef } from 'react'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { useUIStore } from '../store/ui'
import { useChatStore } from '../store/chat'
import { PanelLeft, PanelRight, Sparkles, User as UserIcon, Loader2 } from 'lucide-react'
import { ChatPane } from '../components/dashboard/ChatPane'

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
    isRightSidebarOpen,
    toggleRightSidebar 
  } = useUIStore()
  const { messages, isLoading } = useChatStore()
  const mainScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  // Scroll to bottom whenever messages or loading state change
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = mainScrollRef.current.scrollHeight
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
  let placeholder = 'HissePro asistanına borsa veya finans hakkında soru sorun...'

  const pathname = location.pathname.toLowerCase()
  if (pathname.includes('/endeksler/')) {
    const parts = pathname.split('/endeksler/')
    if (parts[1]) {
      const endeksId = parts[1]
      context = `endeks:${endeksId}`
      const indexName = endeksId === 'bist30' ? 'BIST 30' : endeksId === 'bist100' ? 'BIST 100' : endeksId === 'bistbanka' ? 'BIST Bankacılık' : endeksId.toUpperCase()
      placeholder = `${indexName} endeks analiz asistanına soru sorun...`
    }
  } else if (pathname.includes('/sirketler/')) {
    const parts = pathname.split('/sirketler/')
    if (parts[1]) {
      const ticker = parts[1].toUpperCase()
      context = `sirket:${ticker.toLowerCase()}`
      placeholder = `${ticker} hisse analiz asistanına soru sorun...`
    }
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
        
        {/* Floating Mobile/Desktop Toggle Controls (Glassmorphic design, only appears when panels are closed/hidden) */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-35">
          {!isLeftSidebarExpanded && (
            <button
              onClick={toggleLeftSidebarExpanded}
              className="lg:hidden p-2 rounded-xl bg-card/80 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-all cursor-pointer shadow-md flex items-center justify-center"
              title="Menüyü Göster"
            >
              <PanelLeft size={16} />
            </button>
          )}
        </div>

        {!isRightSidebarOpen && (
          <button
            onClick={toggleRightSidebar}
            className="absolute top-4 right-4 p-2 rounded-xl bg-card/80 backdrop-blur-md border border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-card transition-all z-35 cursor-pointer shadow-md flex items-center justify-center hover:scale-105"
            title="Sağ Paneli Göster"
          >
            <PanelRight size={16} />
          </button>
        )}

        {/* Scrollable Sub-Page area (Outlet) OR Active Chat Stream Messages */}
        <main 
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar min-w-0 relative z-10 pb-20 scroll-smooth"
        >
          {messages.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                      <Sparkles size={14} />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-sm shadow-sm"
                      : "bg-muted/40 text-foreground border border-border/40 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 border border-border/50 shadow-2xs">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-pulse justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                    <Sparkles size={14} />
                  </div>
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

        {/* Fixed Chatbot at the absolute bottom - Compact, Elegant Solid Background Single-Row Container */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/80 bg-card z-40 h-[72px] flex flex-col shadow-lg">
          <ChatPane
            context={context}
            placeholder={placeholder}
            className="h-full border-none shadow-none bg-transparent min-h-0"
          />
        </div>
      </div>

      {/* Sağ Collapsible Sidebar */}
      <RightSidebar />
    </div>
  )
}
