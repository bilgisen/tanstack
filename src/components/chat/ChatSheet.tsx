import { useEffect } from "react";
import { ChatPanel } from "./ChatPanel";
import type { UserProfile } from "../../hooks/useAuth";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  placeholder?: string;
  user?: UserProfile | null;
  sessionLoading?: boolean;
}

export function ChatSheet({ isOpen, onClose, context, placeholder, user, sessionLoading }: ChatSheetProps) {
  // Prevent page scroll when sheet is open (iOS-safe)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      // overflow:hidden alone doesn't work on iOS Safari — also need position:fixed
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Set 100vh properly for mobile
      const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
        window.removeEventListener('resize', setVh);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden font-sans select-none overflow-hidden">
      {/* 1. Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* 2. Slide-up Sheet Panel */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex flex-col bg-card border-t border-border/80 rounded-t-[28px] shadow-2xl animate-in slide-in-from-bottom duration-300 overscroll-none"
        style={{ 
          height: 'calc(var(--vh, 1vh) * 90)',
          maxHeight: '90vh'
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center py-2.5 cursor-pointer flex-shrink-0 border-b border-border/10 bg-card rounded-t-[20px]" 
          onClick={onClose}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25 hover:bg-muted-foreground/40 transition-colors" />
        </div>

        {/* ChatPanel - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatPanel 
            context={context} 
            placeholder={placeholder} 
            onClose={onClose}
            user={user}
            sessionLoading={sessionLoading}
            isMobile={true}
          />
        </div>
      </div>
    </div>
  );
}
