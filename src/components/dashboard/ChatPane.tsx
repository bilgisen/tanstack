import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Loader2, User as UserIcon, HelpCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

interface ChatPaneProps {
  context?: string;
  preseededWelcomeMessage?: string;
  placeholder?: string;
  className?: string;
}

export function ChatPane({
  context = "global",
  preseededWelcomeMessage,
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
  }, [messages]);

  // Welcome message
  const welcomeText = preseededWelcomeMessage || 
    (context.startsWith("sirket:") 
      ? `Merhaba! ${context.split(":")[1].toUpperCase()} hissesinin güncel rasyolarını, bilançosunu ve teknik seviyelerini analiz ettim. Hisse hakkında merak ettiğiniz her şeyi sorabilirsiniz.`
      : context.startsWith("endeks:")
      ? `Merhaba! ${context.split(":")[1].toUpperCase()} endeksi, bileşenlerin ağırlığı ve teknik momentum seviyeleri hakkında sorularınızı yanıtlayabilirim.`
      : "Merhaba! Ben HissePro finansal yapay zeka asistanıyım. BIST hisseleri, temel ve teknik analizler, rasyolar veya piyasa gidişatı hakkında sorularınızı cevaplamaya hazırım. Nasıl yardımcı olabilirim?");

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

      // Strip potential navigate matches if any (handled gracefully)
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

  // Preseeded suggestions based on context
  const getSuggestions = () => {
    if (context.startsWith("sirket:")) {
      const ticker = context.split(":")[1].toUpperCase();
      return [
        `📊 ${ticker} hissesinin F/K ve PD/DD analizini yap`,
        `📈 ${ticker} için kısa vadeli teknik destek/direnç seviyeleri neler?`,
        `🏢 ${ticker} sektörel rakiplerine göre ucuz mu pahalı mı?`,
      ];
    }
    if (context.startsWith("endeks:")) {
      const idx = context.split(":")[1].toUpperCase();
      return [
        `📊 ${idx} endeksinin teknik momentumu nasıl?`,
        `⚖️ ${idx} endeksinde en yüksek ağırlığa sahip hisseler hangileri?`,
        `🎯 ${idx} için direnç seviyeleri ve olası geri çekilme noktaları nedir?`,
      ];
    }
    return [
      "🔥 Bugün BIST'te öne çıkan sektörler ve hareketli hisseler neler?",
      "📈 Enflasyonist ortamda hangi finansal rasyoları incelemeliyim?",
      "🧐 Teknik analizde RSI ve Bollinger bantlarını nasıl okumalıyım?",
    ];
  };

  return (
    <div className={`flex flex-col bg-card/45 border border-border/80 rounded-2xl overflow-hidden shadow-sm h-full max-h-[600px] min-h-[350px] ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-muted/20 shrink-0">
        <Sparkles size={16} className="text-primary" />
        <span className="text-sm font-bold text-foreground tracking-tight">HissePro AI Finans Asistanı</span>
        <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
          {context.includes(":") ? context.replace(":", " | ") : "Global"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-transparent">
        {/* Welcome Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="bg-muted/30 text-foreground text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] leading-relaxed border border-border/40">
            {welcomeText}
          </div>
        </div>

        {/* Conversation */}
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

      {/* Quick Suggestions (only if less than 2 messages sent) */}
      {messages.length < 2 && (
        <div className="px-5 pb-3 pt-1 shrink-0">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={10} /> Hızlı Sorular
            </span>
            <div className="flex flex-wrap gap-1.5">
              {getSuggestions().map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion.substring(2))}
                  className="text-left text-xs bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/40 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-normal truncate-multiline max-w-full"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Textarea Input Container */}
      <div className="p-3 border-t border-border/60 bg-muted/10 shrink-0">
        <div className="relative flex items-center bg-card border border-border rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none pl-4 pr-12 py-3 text-xs md:text-sm text-foreground placeholder-muted-foreground disabled:opacity-50 min-h-[44px] max-h-[100px] font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer shadow-sm"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
