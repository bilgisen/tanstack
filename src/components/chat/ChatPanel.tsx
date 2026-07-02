import { useEffect, useRef, useState } from "react";
import { History, Loader2, Maximize2, Minimize2, Plus, X } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { useUIStore } from "../../store/ui";
import { ChatPane } from "../dashboard/ChatPane";
import { MarkdownRenderer } from "../dashboard/MarkdownRenderer";
import { Logo } from "../layout/Logo";
import { Bubble, BubbleContent } from "../ui/bubble";
import { Marker } from "../ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../ui/message-scroller";

interface ChatPanelProps {
  context: string;
  placeholder?: string;
  onClose?: () => void;
  user?: any;
  sessionLoading?: boolean;
}

export function ChatPanel({ context, placeholder, onClose, user, sessionLoading }: ChatPanelProps) {
  const { messages, isLoading, sessions, activeSessionId, loadSession, deleteSession, clearChat } = useChatStore();
  const { isChatMaximized, toggleChatMaximized } = useUIStore();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Listen for ChatSheet open/close events to disable scrolling
  useEffect(() => {
    const handleChatSheetOpen = () => setIsOverlayOpen(true);
    const handleChatSheetClose = () => setIsOverlayOpen(false);
    
    window.addEventListener('chat-sheet-open', handleChatSheetOpen);
    window.addEventListener('chat-sheet-close', handleChatSheetClose);
    
    return () => {
      window.removeEventListener('chat-sheet-open', handleChatSheetOpen);
      window.removeEventListener('chat-sheet-close', handleChatSheetClose);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background relative font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* 1. Header - Fixed height, no shrink */}
      <div
        className="h-14 flex items-center justify-between px-5 border-b border-border/50 bg-background/95 backdrop-blur-md flex-shrink-0 select-none z-10 relative"
        ref={historyRef}
      >
        <span className="text-sm font-normal text-foreground">Araştır</span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => clearChat()}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title="Yeni Sohbet"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
              historyOpen
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            title="Sohbet Geçmişi"
          >
            <History size={16} />
          </button>

          <button
            onClick={toggleChatMaximized}
            className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer items-center justify-center active:scale-95"
            title={isChatMaximized ? "Sohbeti Küçült" : "Sohbeti Genişlet"}
          >
            {isChatMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* History Dropdown */}
        {historyOpen && (
          <div className="absolute right-5 top-12 w-64 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider px-3 pb-2 pt-1.5 border-b border-border/30 mb-1">
              Geçmiş Sohbetler
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground/60 italic text-center">
                  Sohbet geçmişi bulunmuyor.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      session.id === activeSessionId
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      loadSession(session.id);
                      setHistoryOpen(false);
                    }}
                  >
                    <span className="truncate pr-2 select-none">
                      {session.ticker || "Genel"} Analizi
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                      title="Sil"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Messages Area - Flex grow with proper MessageScroller */}
      <MessageScrollerProvider>
        <MessageScroller className={`flex-1 min-h-0 ${isOverlayOpen ? '!overflow-hidden' : ''}`}>
          <MessageScrollerViewport 
            className={`h-full ${isOverlayOpen ? '!overflow-hidden [&::-webkit-scrollbar]:!hidden' : ''}`}
            style={isOverlayOpen ? { overflow: 'hidden !important' } as any : undefined}
          >
            <MessageScrollerContent className="gap-4 p-5">
              {messages.length === 0 ? (
                <MessageScrollerItem className="flex items-center justify-center min-h-[300px]">
                  <div className="flex flex-col items-center text-center p-6 space-y-4 max-w-md mx-auto select-none opacity-80">
                    <Logo size={44} variant="icon" />
                    <div className="space-y-1">
                      <h5 className="text-base font-semibold text-foreground">Araştırmaya Başlayın</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Hisseler, rasyolar, bilançolar ve teknik formasyonlar hakkında sorularınızı sorun.
                        BIST odaklı yapay zeka analiz etsin.
                      </p>
                    </div>
                  </div>
                </MessageScrollerItem>
              ) : (
                messages.map((msg, idx) => (
                  <MessageScrollerItem key={idx}>
                    <div className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="shrink-0 mt-1">
                          <Logo size={22} variant="icon" />
                        </div>
                      )}

                      <div className={`${msg.role === "user" ? "max-w-[85%]" : "w-full min-w-0"}`}>
                        <Bubble
                          variant={msg.role === "user" ? "default" : "secondary"}
                          align={msg.role === "user" ? "end" : "start"}
                        >
                          <BubbleContent
                            className={`px-3.5 py-2.5 rounded-2xl ${
                              msg.role === "user"
                                ? "rounded-tr-sm"
                                : "rounded-tl-sm border border-border/30"
                            }`}
                          >
                            <MarkdownRenderer
                              text={msg.text}
                              isAssistant={msg.role === "assistant"}
                              context={msg.context || context}
                              suggestions={msg.suggestions}
                              widget={msg.widget}
                            />
                          </BubbleContent>
                        </Bubble>
                      </div>
                    </div>
                  </MessageScrollerItem>
                ))
              )}

              {isLoading && (
                <MessageScrollerItem>
                  <div className="flex gap-2.5 justify-start">
                    <div className="shrink-0 mt-1">
                      <Logo size={22} variant="icon" />
                    </div>
                    <Bubble variant="muted" align="start">
                      <BubbleContent className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-border/30 flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Analiz raporu hazırlıyor...
                        </span>
                      </BubbleContent>
                    </Bubble>
                  </div>
                </MessageScrollerItem>
              )}

              {messages.length > 0 && (
                <MessageScrollerItem scrollAnchor>
                  <Marker variant="separator" className="py-1 opacity-0">
                    <span className="text-[10px]">son</span>
                  </Marker>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* 3. Input Footer - Fixed height, no shrink */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background">
        <ChatPane
          context={context}
          placeholder={placeholder}
          className="w-full"
          user={user}
          sessionLoading={sessionLoading}
        />
      </div>
    </div>
  );
}
