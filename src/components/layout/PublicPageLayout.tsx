import { useState } from "react";
import { ChatPanel } from "../chat/ChatPanel";
import { ChatSheet } from "../chat/ChatSheet";
import { useUIStore } from "../../store/ui";
import { Logo } from "./Logo";

interface PublicPageLayoutProps {
  context: string;
  placeholder?: string;
  children: React.ReactNode;
}

export function PublicPageLayout({ context, placeholder, children }: PublicPageLayoutProps) {
  const { isChatMaximized } = useUIStore()
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-row min-w-0 h-full overflow-hidden">

      {/* Left: Page Content */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden ${isChatMaximized ? 'hidden md:hidden' : ''}`}>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar min-w-0 relative z-10 pb-24 md:pb-4 scroll-smooth">
          <div className="w-full max-w-5xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile floating chat trigger */}
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

      {/* Desktop: Chat Panel */}
      <div className={`hidden md:block h-full shrink-0 transition-all duration-300 ${isChatMaximized ? 'w-full flex-1' : 'md:w-[360px] lg:w-[400px] xl:w-[440px]'}`}>
        <ChatPanel context={context} placeholder={placeholder} />
      </div>

      {/* Mobile: Chat Sheet */}
      <ChatSheet
        isOpen={isChatSheetOpen}
        onClose={() => setIsChatSheetOpen(false)}
        context={context}
        placeholder={placeholder}
      />
    </div>
  )
}
