import { useRef, useEffect } from "react";
import { useChatStore } from "../../store/chat";
import { MarkdownRenderer } from "../dashboard/MarkdownRenderer";
import { ChatPane } from "../dashboard/ChatPane";
import { ModelSelector } from "../dashboard/ModelSelector";
import { Loader2, MessageSquare, Compass, X } from "lucide-react";

interface ChatPanelProps {
  context: string;
  placeholder?: string;
  onClose?: () => void;
}

export function ChatPanel({ context, placeholder, onClose }: ChatPanelProps) {
  const { messages, isLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Determine breadcrumb label based on context
  let contextLabel = "Genel Sohbet";
  if (context.startsWith("sirket:")) {
    contextLabel = `${context.split(":")[1].toUpperCase()} Analizi`;
  } else if (context.startsWith("endeks:")) {
    const endeksId = context.split(":")[1];
    contextLabel = endeksId === "bist30" ? "BIST 30" : endeksId === "bist100" ? "BIST 100" : endeksId === "bistbanka" ? "BIST Bankacılık" : endeksId.toUpperCase();
  } else if (context === "takip-listesi") {
    contextLabel = "Takip Listesi";
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border/60 relative overflow-hidden font-sans">
      {/* 1. Header Banner */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border/50 bg-background/95 backdrop-blur-md shrink-0 select-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-pulse" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={13} className="text-muted-foreground" />
            <span>{contextLabel}</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded-full">
            {messages.length} mesaj
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <ModelSelector />
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={15} />
            </button>
          )}
        </div>
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
          />
        </div>
      </div>
    </div>
  );
}
