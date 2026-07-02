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
  // Prevent page scroll when sheet is open and handle keyboard
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      // Handle visual viewport resize (keyboard open/close)
      const handleResize = () => {
        if (window.visualViewport) {
          const vh = window.visualViewport.height;
          document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
        }
      };

      // Initial set
      handleResize();
      
      window.visualViewport?.addEventListener('resize', handleResize);
      window.visualViewport?.addEventListener('scroll', handleResize);
      
      return () => {
        document.body.style.overflow = "unset";
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('scroll', handleResize);
        document.documentElement.style.removeProperty('--vh');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col font-sans select-none">
      {/* 1. Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      />

      {/* 2. Slide-up Sheet Panel - Responsive to keyboard */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/80 rounded-t-[28px] z-10 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{
          height: 'calc(var(--vh, 1vh) * 90)',
          maxHeight: '90vh'
        }}
      >
        {/* Drag Handle Top Bar */}
        <div className="w-full flex justify-center py-3.5 bg-card rounded-t-[28px] cursor-pointer shrink-0 border-b border-border/10" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
        </div>

        {/* Dedicated ChatPanel inside */}
        <div className="flex-1 overflow-hidden min-h-0">
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
