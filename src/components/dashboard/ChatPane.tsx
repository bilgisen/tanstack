import { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { useNavigate, useLocation } from "@tanstack/react-router";
import companyNames from "../../constants/companyNames.json";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
}

export function ChatPane({
  context = "global",
  placeholder = "Bir soru sorun...",
  className = "",
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const { isLoading, sendMessage, clearChat } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const detectTargetAsset = (text: string): { path: string; context: string } | null => {
    const textLower = text.toLowerCase();
    
    // Check indices first
    if (textLower.includes("bist 100") || textLower.includes("bist100") || textLower.includes("xu100")) {
      return { path: "/panel/endeksler/bist100", context: "endeks:bist100" };
    }
    if (textLower.includes("bist 30") || textLower.includes("bist30") || textLower.includes("xu030")) {
      return { path: "/panel/endeksler/bist30", context: "endeks:bist30" };
    }
    if (textLower.includes("bist 500") || textLower.includes("bist500") || textLower.includes("xu500")) {
      return { path: "/panel/endeksler/bist500", context: "endeks:bist500" };
    }
    if (textLower.includes("bankacılık") || textLower.includes("bist banka") || textLower.includes("xbank") || textLower.includes("bistbanka")) {
      return { path: "/panel/endeksler/bistbanka", context: "endeks:bistbanka" };
    }

    // Check stocks
    const words = textLower.match(/[a-zA-Z0-9]+/g) || [];
    for (const w of words) {
      const upperWord = w.toUpperCase();
      if (upperWord.length >= 3 && upperWord.length <= 6 && upperWord in companyNames) {
        return { path: `/panel/sirketler/${w.toLowerCase()}`, context: `sirket:${w.toLowerCase()}` };
      }
    }
    return null;
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Smart Redirection Logic
    const currentPath = location.pathname.toLowerCase();
    const isGlobalHome = currentPath === "/panel" || currentPath === "/panel/" || context === "global";
    
    if (isGlobalHome) {
      const target = detectTargetAsset(textToSend);
      if (target) {
        // Clear global chats first to avoid pollution, then navigate and send message in correct context
        clearChat();
        navigate({ to: target.path as any });
        await sendMessage(textToSend, target.context);
        return;
      }
    }

    await sendMessage(textToSend, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    
    // Auto-grow height logic
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  };

  return (
    <div className={`flex items-center gap-3 bg-transparent px-4 py-1.5 w-full select-none ${className}`}>
      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-base md:text-[17px] text-foreground placeholder-muted-foreground/60 disabled:opacity-50 min-h-[38px] max-h-[140px] font-sans leading-relaxed custom-scrollbar"
      />

      {/* Semantic Green Send Button */}
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0 self-center"
        title="Gönder"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
