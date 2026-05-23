import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Loader2, User as UserIcon, Plus, Mic, ChevronDown } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

interface ChatPaneProps {
  context?: string;
  onMessagesChange?: (hasMessages: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function ChatPane({
  context = "global",
  onMessagesChange,
  placeholder = "HissePro asistanına borsa veya finans hakkında soru sorun...",
  className = "",
}: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (onMessagesChange) {
      onMessagesChange(messages.length > 0);
    }
  }, [messages, onMessagesChange]);

  const handleSend = async (forcedMessage?: string) => {
    const textToSend = forcedMessage || input.trim();
    if (!textToSend || isLoading) return;

    if (!forcedMessage) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          context: context,
        }),
      });

      if (!response.ok) throw new Error("API response error");

      const data = await response.json();
      let replyText = data.reply || "Bir hata oluştu.";

      // Strip potential navigate matches
      const navigateMatch = replyText.match(/\[NAVIGATE:(.*?)\]/);
      if (navigateMatch) {
        replyText = replyText.replace(navigateMatch[0], "").trim();
      }

      setMessages((prev) => [...prev, { role: "assistant", text: replyText }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Özür dilerim, şu an yanıt üretemiyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col bg-transparent h-full min-h-0 ${className}`}>
      {/* Messages (Displays only if there are any active user messages) */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-transparent custom-scrollbar max-h-[110px] min-h-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-primary/10 text-primary"
              }`}>
                {msg.role === "user" ? <UserIcon size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed border ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground border-primary rounded-tr-sm"
                  : "bg-muted/30 text-foreground border-border/40 rounded-tl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={14} />
              </div>
              <div className="bg-muted/20 text-muted-foreground text-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                Yapay zeka analiz ediyor...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Textarea Input Container (Floating Solid Rounded Box matching the screenshot) */}
      <div className="p-3 bg-transparent shrink-0">
        <div className="flex flex-col bg-muted/40 border border-border/85 rounded-2xl p-2.5 focus-within:border-border transition-all select-none">
          {/* Top text area */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none px-2.5 py-1 text-xs md:text-sm text-foreground placeholder-muted-foreground/60 disabled:opacity-50 min-h-[36px] max-h-[80px] font-sans"
          />
          
          {/* Bottom Action Controls Bar */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
            {/* Left Controls: Plus + Model Dropdown */}
            <div className="flex items-center gap-2.5 pl-1">
              {/* Plus Button */}
              <button className="w-6 h-6 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-muted/60 rounded-md transition-colors cursor-pointer">
                <Plus size={15} />
              </button>
              
              {/* Model Dropdown */}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/60 hover:bg-muted/95 px-2 py-0.5 rounded-md cursor-pointer transition-colors border border-border/40 font-semibold font-mono">
                <span>Sonnet 4.6</span>
                <ChevronDown size={9} />
              </div>
            </div>
            
            {/* Right Controls: Mic + Send Button */}
            <div className="flex items-center gap-2 pr-1">
              {/* Mic Icon */}
              <button className="w-6 h-6 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-muted/60 rounded-md transition-colors cursor-pointer">
                <Mic size={14} />
              </button>
              
              {/* Premium Coral-Orange Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#d95438] hover:bg-[#c4472c] text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0"
                title="Gönder"
              >
                <ArrowUp size={13} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
