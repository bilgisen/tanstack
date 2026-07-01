import { useRef, useEffect, useState } from "react";
import { useChatStore } from "../../store/chat";
import { MarkdownRenderer } from "../dashboard/MarkdownRenderer";
import { ChatPane } from "../dashboard/ChatPane";
import { useUIStore } from "../../store/ui";
import { Loader2, Compass, X, Plus, History, Maximize2, Minimize2 } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
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

  // Auto scroll to bottom when messages or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);



  return (
    <div className="flex flex-col h-full bg-card border-l border-border/60 relative overflow-hidden font-sans">
      {/* 1. Header Banner */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border/50 bg-background/95 backdrop-blur-md shrink-0 select-none z-10 relative" ref={historyRef}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-foreground">Sohbet</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* New Chat Button */}
          <button
            onClick={() => clearChat()}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-transparent active:scale-95"
            title="Yeni Sohbet"
          >
            <Plus size={16} />
          </button>

          {/* Sohbet Geçmişi Button */}
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-transparent active:scale-95 ${historyOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            title="Sohbet Geçmişi"
          >
            <History size={16} />
          </button>

          {/* Maximize / Minimize Button */}
          <button
            onClick={toggleChatMaximized}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-transparent active:scale-95"
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

        {/* History Dropdown Overlay */}
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
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${session.id === activeSessionId ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
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

      {/* 2. Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar min-h-0 relative z-0"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto select-none opacity-80">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Compass size={24} className="animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">Sohbete Başlayın</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hisseler, rasyolar, bilançolar ve teknik formasyonlar hakkında sorularınızı sorun. BIST odaklı yapay zeka analiz etsin.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-xs md:text-sm max-w-[85%] sm:max-w-[78%] leading-relaxed ${
                  msg.role === "user"
                    ? "chat-question-bubble font-medium rounded-tr-sm shadow-sm"
                    : "bg-muted/40 text-foreground border border-border/40 rounded-tl-sm w-full chatbot-response"
                }`}
              >
                <MarkdownRenderer
                  text={msg.text}
                  isAssistant={msg.role === "assistant"}
                  context={msg.context || context}
                  suggestions={msg.suggestions}
                  widget={msg.widget}
                />
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-muted/20 text-muted-foreground text-xs md:text-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-primary" />
              <span>Yapay zeka analiz raporu hazırlıyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Input Footer */}
      <div className="border-t border-border/40 bg-background/50 backdrop-blur-md p-4 shrink-0">
        <div className="w-full bg-background/80 border border-border/50 rounded-full shadow-sm overflow-hidden">
          <ChatPane
            context={context}
            placeholder={placeholder}
            className="w-full border-none shadow-none bg-transparent"
            user={user}
            sessionLoading={sessionLoading}
          />
        </div>
      </div>
    </div>
  );
}
