import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useNavigate } from "@tanstack/react-router";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function RightSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Merhaba! Ben finansal analiz asistanınızım. Dolar kuru, hisse senedi detayları veya piyasa trendleri hakkında bana sorular sorabilirsiniz." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: window.location.pathname, // Mevcut sayfa url'si bağlam olarak gönderilir
        }),
      });

      if (!response.ok) throw new Error("API yanıt vermedi");
      
      const data = await response.json();
      let replyText = data.reply || "Bir hata oluştu.";

      // Intent-based Navigate kontrolü
      const navigateMatch = replyText.match(/\[NAVIGATE:(.*?)\]/);
      if (navigateMatch) {
        const path = navigateMatch[1];
        replyText = replyText.replace(navigateMatch[0], "").trim();
        navigate({ to: path as any }); // Rota yönlendirmesi
      }

      if (replyText.trim()) {
         setMessages((prev) => [...prev, { role: "assistant", text: replyText }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", text: "Üzgünüm, şu an sunucuya bağlanamıyorum." }]);
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

  const chatContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-emerald-600" : "bg-zinc-800"}`}>
              {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} className="text-emerald-400" />}
            </div>
            <div className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] ${msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-zinc-800 text-zinc-300 rounded-tl-sm border border-zinc-700 whitespace-pre-wrap"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-emerald-400" />
            </div>
            <div className="rounded-2xl px-4 py-2 text-sm bg-zinc-800 text-zinc-300 rounded-tl-sm border border-zinc-700 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Analiz ediliyor...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Sorunuzu yazın..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-3 pr-12 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden md:flex flex-col border-l border-zinc-800 bg-zinc-950/80 backdrop-blur-md transition-all duration-300
        ${isRightSidebarOpen ? "w-[360px]" : "w-0 overflow-hidden border-none"}
      `}>
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-emerald-500 font-medium">
            <Bot size={20} />
            <span className="font-semibold tracking-tight">Terminal AI</span>
          </div>
          <button onClick={toggleRightSidebar} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {isRightSidebarOpen && chatContent}
      </aside>

      {/* Mobile FAB */}
      <button 
        className="md:hidden fixed bottom-16 right-4 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 z-50 text-white transition-transform hover:scale-105 active:scale-95"
        onClick={toggleRightSidebar}
      >
        <MessageSquare size={20} />
      </button>

      {/* Mobile Chat Bottom Sheet */}
      {isRightSidebarOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={toggleRightSidebar} />
          <div className="md:hidden fixed inset-x-0 bottom-0 h-[85vh] bg-zinc-950 border-t border-zinc-800 z-50 flex flex-col rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2 text-emerald-500 font-medium">
                <Bot size={20} />
                <span className="font-semibold tracking-tight">Terminal AI</span>
              </div>
              <button onClick={toggleRightSidebar} className="text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900 p-1.5 rounded-full">
                <X size={16} />
              </button>
            </div>
            
            {chatContent}
          </div>
        </>
      )}
    </>
  );
}
