import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { RightSidebar } from '../components/layout/RightSidebar'
import { useUIStore } from '../store/ui'
import { Zap } from 'lucide-react'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore()

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

  return (
    <div className="flex-1 flex flex-row overflow-hidden relative bg-background font-sans h-full">
      {/* Sol Collapsible Sidebar */}
      <LeftSidebar />

      {/* Orta Kolon (Scrollable Content Viewport) */}
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 min-w-0 flex flex-col relative z-0 custom-scrollbar">
        <Outlet />
      </main>

      {/* Sağ Collapsible Sidebar */}
      <RightSidebar />

      {/* Floating Toggle to re-open Right Sidebar if closed */}
      {!isRightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="fixed right-0 top-24 bg-card hover:bg-muted border border-r-0 border-border rounded-l-lg p-2.5 shadow-sm hover:text-primary transition-all z-40 cursor-pointer flex items-center justify-center group animate-in slide-in-from-right duration-200"
          title="Piyasa Analizini Göster"
        >
          <Zap size={14} className="text-primary group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )
}
