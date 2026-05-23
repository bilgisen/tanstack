import { createFileRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { useUIStore } from '../store/ui'
import { PanelLeft } from 'lucide-react'
import { ChatPane } from '../components/dashboard/ChatPane'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLeftSidebarExpanded, toggleLeftSidebarExpanded } = useUIStore()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

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
  let preseededWelcomeMessage = undefined

  const pathname = location.pathname.toLowerCase()
  if (pathname.includes('/endeksler/')) {
    const parts = pathname.split('/endeksler/')
    if (parts[1]) {
      const endeksId = parts[1]
      context = `endeks:${endeksId}`
      const indexName = endeksId === 'bist30' ? 'BIST 30' : endeksId === 'bist100' ? 'BIST 100' : endeksId === 'bistbanka' ? 'BIST Bankacılık' : endeksId.toUpperCase()
      placeholder = `${indexName} endeks analiz asistanına soru sorun...`
      preseededWelcomeMessage = `Merhaba! **${indexName} Endeksi** bileşenlerini, hacim hareketlerini ve teknik trend gücünü analiz ettim. Bu endeks veya hisseleri hakkında sormak istediğiniz her şeyi cevaplayabilirim.`
    }
  } else if (pathname.includes('/sirketler/')) {
    const parts = pathname.split('/sirketler/')
    if (parts[1]) {
      const ticker = parts[1].toUpperCase()
      context = `sirket:${ticker.toLowerCase()}`
      placeholder = `${ticker} hisse analiz asistanına soru sorun...`
      preseededWelcomeMessage = `Merhaba! **${ticker}** hissesinin bilançosunu, İş Yatırım rasyolarını ve teknik analiz indikatörlerini taradım. Hissenin çarpan değerleri, destek/direnç noktaları veya gelecek beklentileri hakkında her türlü soruyu yanıtlayabilirim.`
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
      {/* Sol Collapsible Sidebar (1/4 Column) */}
      <LeftSidebar />

      {/* Ana Kolon (3/4 Column) */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-background">
        {/* Top Header inside main column */}
        <header className="h-14 border-b border-border/85 bg-card/40 backdrop-blur-xs flex items-center px-4 md:px-6 shrink-0 justify-between z-30 select-none">
          <div className="flex items-center gap-3">
            {/* Toggle button using PanelLeft icon */}
            <button
              onClick={toggleLeftSidebarExpanded}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer flex items-center justify-center border border-border/50 bg-card/50 shadow-2xs"
              title={isLeftSidebarExpanded ? "İzleme Listesini Gizle" : "İzleme Listesini Göster"}
            >
              <PanelLeft size={16} />
            </button>
            
            {/* Section Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>HissePro</span>
              <span>/</span>
              <span className="text-foreground font-bold">{getPageTitle()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase">
              Asistan Aktif
            </span>
          </div>
        </header>

        {/* Scrollable Sub-Page area (Outlet) */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-[300px] custom-scrollbar min-w-0 relative z-10">
          <Outlet />
        </main>

        {/* Fixed Chatbot at the absolute bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[260px] border-t border-border bg-card/95 backdrop-blur-md z-40 flex flex-col shadow-lg animate-in slide-in-from-bottom duration-300">
          <ChatPane
            context={context}
            placeholder={placeholder}
            preseededWelcomeMessage={preseededWelcomeMessage}
            className="h-full border-none shadow-none bg-transparent min-h-0 max-h-none rounded-none"
          />
        </div>
      </div>
    </div>
  )
}

