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

  // Dynamic title based on active path
  const getPageTitle = () => {
    if (pathname === '/panel' || pathname === '/panel/') return 'Genel Bakış'
    if (pathname.includes('/endeksler/')) return 'Endeks Analizi'
    if (pathname.includes('/sirketler/')) return 'Şirket Analizi'
    if (pathname.includes('/borsa')) return 'Borsa'
    return 'Panel'
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
        {/* Top Header inside main column (Sleeker h-12 height) */}
        <header className="h-12 border-b border-border/60 bg-card/45 backdrop-blur-xs flex items-center px-4 md:px-6 shrink-0 justify-between z-20 select-none">
          <div className="flex items-center gap-3">
            {/* Toggle button using PanelLeft icon */}
            <button
              onClick={toggleLeftSidebarExpanded}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center border border-border/50 bg-card/50 shadow-2xs"
              title={isLeftSidebarExpanded ? "Paneli Gizle" : "Paneli Göster"}
            >
              <PanelLeft size={14} />
            </button>
            
            {/* Section Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>HissePro</span>
              <span>/</span>
              <span className="text-foreground font-bold">{getPageTitle()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase hidden sm:inline-block">
              Asistan Aktif
            </span>
            {/* Symmetrical Right Sidebar Toggle Button using PanelRight */}
            <button
              onClick={toggleRightSidebar}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center border border-border/50 bg-card/50 shadow-2xs"
              title={isRightSidebarOpen ? "Pazar Analizini Gizle" : "Pazar Analizini Göster"}
            >
              <PanelRight size={14} />
            </button>
          </div>
        </header>

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
