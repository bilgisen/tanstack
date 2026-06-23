import { useEffect } from "react";
import { ChatPanel } from "./ChatPanel";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  placeholder?: string;
  user?: any;
}

export function ChatSheet({ isOpen, onClose, context, placeholder, user }: ChatSheetProps) {
  // Prevent page scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end font-sans select-none">
      {/* 1. Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      />

      {/* 2. Slide-up Sheet Panel */}
      <div 
        className="w-full h-[85vh] bg-card border-t border-border/80 rounded-t-[28px] relative z-10 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag Handle Top Bar */}
        <div className="w-full flex justify-center py-3.5 bg-card rounded-t-[28px] cursor-pointer shrink-0 border-b border-border/10" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
        </div>

        {/* Dedicated ChatPanel inside */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel 
            context={context} 
            placeholder={placeholder} 
            onClose={onClose}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
