import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, ArrowUp, Plus, Edit, History, Maximize, Sparkles, Globe, LineChart, Loader2, Bot, User as UserIcon } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useNavigate } from "@tanstack/react-router";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function RightSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([]);
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
          context: window.location.pathname,
        }),
      });

      if (!response.ok) throw new Error("API yanıt vermedi");
      
      const data = await response.json();
      let replyText = data.reply || "Bir hata oluştu.";

      const navigateMatch = replyText.match(/\[NAVIGATE:(.*?)\]/);
      if (navigateMatch) {
        const path = navigateMatch[1];
        replyText = replyText.replace(navigateMatch[0], "").trim();
        navigate({ to: path as any });
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

  const isEmpty = messages.length === 0;

  const chatContent = (
    <>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white dark:bg-[#0f1115]">
        {isEmpty ? (
          <div className="space-y-8 pt-2 animate-in fade-in duration-500">
            <div>
              <h2 className="text-[22px] font-bold text-zinc-900 dark:text-zinc-100 mb-5 tracking-tight">
                Aklınızda ne var?
              </h2>
              <button 
                onClick={() => handleSend("Bugün piyasalarda neler oluyor?")}
                className="w-full bg-zinc-50 hover:bg-zinc-100 dark:bg-[#1a1c23] dark:hover:bg-[#22252d] border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-2xl p-4 flex items-center justify-between transition-all group text-left"
              >
                <span className="text-[15px] text-zinc-700 dark:text-zinc-200 font-medium">Bugün piyasalarda neler oluyor?</span>
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">
                  <Sparkles size={16} />
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[15px] font-semibold text-zinc-600 dark:text-zinc-300">Neler yapabileceğinizi keşfedin</h3>
              
              <div className="flex flex-col gap-2.5 items-start">
                <button 
                  onClick={() => handleSend("Derin analiz yap (Deep Search)")}
                  className="flex items-center gap-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1c23] dark:hover:bg-[#22252d] text-zinc-700 dark:text-zinc-200 px-5 py-2.5 rounded-full text-[15px] font-medium transition-colors"
                >
                  <Globe size={18} className="text-emerald-600 dark:text-emerald-400" />
                  Deep Search
                </button>

                <button 
                  onClick={() => handleSend("İzleme listemi analiz et")}
                  className="flex items-center gap-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1c23] dark:hover:bg-[#22252d] text-zinc-700 dark:text-zinc-200 px-5 py-2.5 rounded-full text-[15px] font-medium transition-colors"
                >
                  <LineChart size={18} className="text-emerald-600 dark:text-emerald-400" />
                  İzleme listemi analiz et
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-zinc-200 dark:bg-[#1a1c23] text-zinc-600 dark:text-zinc-400" : "bg-emerald-100 dark:bg-[#1a1c23] text-emerald-600 dark:text-emerald-500"
                }`}>
                  {msg.role === "user" ? <UserIcon size={14} /> : <Sparkles size={14} />}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-[15px] max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-zinc-100 dark:bg-[#1a1c23] text-zinc-900 dark:text-zinc-100 rounded-tr-sm" 
                    : "bg-transparent text-zinc-800 dark:text-zinc-200"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-[#1a1c23] text-emerald-600 dark:text-emerald-500 flex items-center justify-center shrink-0">
                  <Sparkles size={14} />
                </div>
                <div className="py-3 text-[15px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-500" /> Analiz ediliyor...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 pt-0 bg-white dark:bg-[#0f1115] shrink-0">
        <div className="relative flex flex-col bg-zinc-100 dark:bg-[#1a1c23] rounded-[24px] border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-colors">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Soru sorun" 
            rows={isEmpty ? 3 : 1}
            className="w-full bg-transparent border-none outline-none resize-none px-5 pt-4 pb-2 text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 disabled:opacity-50 min-h-[56px] max-h-[150px]"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#2a2d36] rounded-full transition-colors">
              <Plus size={20} />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-[#2a2d36] dark:text-zinc-300 hover:bg-zinc-800 dark:hover:text-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-900 dark:disabled:hover:bg-[#2a2d36] transition-colors"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={`
        hidden md:flex flex-col border-l dark:border-zinc-900 border-zinc-200 bg-white dark:bg-[#0f1115] transition-all duration-300
        ${isRightSidebarOpen ? "w-[380px] lg:w-[420px]" : "w-0 overflow-hidden border-none"}
      `}>
        <div className="h-16 flex items-center justify-between px-5 shrink-0">
          <h2 className="text-lg font-semibold tracking-tight dark:text-zinc-100 text-zinc-900">
            Araştırma
          </h2>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1a1c23] rounded-full transition-colors" title="Yeni Sohbet">
              <Edit size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1a1c23] rounded-full transition-colors" title="Geçmiş">
              <History size={18} />
            </button>
            <button onClick={toggleRightSidebar} className="w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1a1c23] rounded-full transition-colors" title="Kapat/Genişlet">
              <Maximize size={18} />
            </button>
          </div>
        </div>
        
        {isRightSidebarOpen && chatContent}
      </aside>

      {/* Mobile FAB and Bottom Sheet */}
      <button 
        className="md:hidden fixed bottom-16 right-4 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/40 z-50 text-white transition-transform hover:scale-105 active:scale-95"
        onClick={toggleRightSidebar}
      >
        <MessageSquare size={18} />
      </button>

      {isRightSidebarOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleRightSidebar} />
          <div className="md:hidden fixed inset-x-0 bottom-0 h-[85vh] bg-white dark:bg-[#0f1115] border-t dark:border-zinc-900 border-zinc-200 z-50 flex flex-col rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="h-16 flex items-center justify-between px-6 shrink-0 mt-2">
              <h2 className="text-lg font-semibold tracking-tight dark:text-zinc-100 text-zinc-900">Araştırma</h2>
              <button onClick={toggleRightSidebar} className="text-zinc-400 dark:hover:text-zinc-200 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
            {chatContent}
          </div>
        </>
      )}
    </>
  );
}
