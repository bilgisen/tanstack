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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-zinc-950/20 bg-zinc-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border dark:border-zinc-800 border-zinc-200 ${
              msg.role === "user" ? "dark:bg-zinc-900 bg-zinc-100 text-zinc-600 dark:text-zinc-350" : "dark:bg-zinc-900 bg-zinc-100 text-emerald-500"
            }`}>
              {msg.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap transition-colors ${
              msg.role === "user" 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-250 dark:border-zinc-700/60 rounded-tr-sm" 
                : "bg-white dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-300 rounded-tl-sm border border-zinc-200 dark:border-zinc-900"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full dark:bg-zinc-900 bg-zinc-100 border dark:border-zinc-800 border-zinc-200 flex items-center justify-center shrink-0 text-emerald-500">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl px-4 py-2.5 text-sm bg-white dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 rounded-tl-sm border border-zinc-200 dark:border-zinc-900 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-emerald-500" /> Analiz ediliyor...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-zinc-900 border-zinc-200 bg-white dark:bg-zinc-950">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Sorunuzu yazın..." 
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 rounded-xl py-3 pl-4 pr-12 text-sm dark:text-zinc-200 text-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 disabled:opacity-50 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-emerald-500 hover:text-emerald-400 dark:hover:bg-emerald-500/10 hover:bg-emerald-500/5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden md:flex flex-col border-l dark:border-zinc-900 border-zinc-200 dark:bg-zinc-950 bg-white transition-all duration-300
        ${isRightSidebarOpen ? "w-[380px]" : "w-0 overflow-hidden border-none"}
      `}>
        <div className="h-14 border-b dark:border-zinc-900 border-zinc-200 flex items-center justify-between px-4 shrink-0 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-emerald-500 font-medium">
            <Bot size={18} />
            <span className="font-semibold tracking-tight dark:text-zinc-200 text-zinc-800">Terminal AI</span>
          </div>
          <button onClick={toggleRightSidebar} className="text-zinc-400 dark:hover:text-zinc-250 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <X size={16} />
          </button>
        </div>
        
        {isRightSidebarOpen && chatContent}
      </aside>

      {/* Mobile FAB */}
      <button 
        className="md:hidden fixed bottom-16 right-4 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/40 z-50 text-white transition-transform hover:scale-105 active:scale-95"
        onClick={toggleRightSidebar}
      >
        <MessageSquare size={18} />
      </button>

      {/* Mobile Chat Bottom Sheet */}
      {isRightSidebarOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleRightSidebar} />
          <div className="md:hidden fixed inset-x-0 bottom-0 h-[85vh] bg-white dark:bg-zinc-950 border-t dark:border-zinc-900 border-zinc-200 z-50 flex flex-col rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="h-14 border-b dark:border-zinc-900 border-zinc-200 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2 text-emerald-500 font-medium">
                <Bot size={18} />
                <span className="font-semibold tracking-tight dark:text-zinc-200 text-zinc-800">Terminal AI</span>
              </div>
              <button onClick={toggleRightSidebar} className="text-zinc-400 dark:hover:text-zinc-200 hover:text-zinc-700 transition-colors bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full">
                <X size={15} />
              </button>
            </div>
            
            {chatContent}
          </div>
        </>
      )}
    </>
  );
}
