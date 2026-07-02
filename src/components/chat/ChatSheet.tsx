import { useEffect } from "react";
import { ChatPanel } from "./ChatPanel";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  placeholder?: string;
  user?: any;
  sessionLoading?: boolean;
}

export function ChatSheet({ isOpen, onClose, context, placeholder, user, sessionLoading }: ChatSheetProps) {
  // Prevent page scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Set 100vh properly for mobile
      const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      
      return () => {
        document.body.style.overflow = "unset";
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
        className="absolute bottom-0 left-0 right-0 flex flex-col bg-card border-t border-border/80 rounded-t-[28px] shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ 
          height: 'calc(var(--vh, 1vh) * 90)',
          maxHeight: '90vh'
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center py-3.5 cursor-pointer flex-shrink-0 border-b border-border/10 bg-card rounded-t-[28px]" 
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
        </div>

        {/* ChatPanel - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatPanel 
            context={context} 
            placeholder={placeholder} 
            onClose={onClose}
            user={user}
            sessionLoading={sessionLoading}
          />
        </div>
      </div>
    </div>
  );
}
