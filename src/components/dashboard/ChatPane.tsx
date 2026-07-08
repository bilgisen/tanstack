import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useChatStore } from "../../store/chat";
import companyNames from "../../constants/companyNames.json";
import tickerToSectorSlug from "../../constants/tickerToSectorSlug";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
  user?: any;
  sessionLoading?: boolean;
}

export function ChatPane({
  context = "global",
  placeholder = "Bir soru sorun...",
  className = "",
  user,
  sessionLoading = false,
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const { isLoading, sendMessage, clearChat } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const detectTargetAsset = (text: string): { path: string; context: string } | null => {
    const textLower = text.toLowerCase();
    
    if (textLower.includes("bist 100") || textLower.includes("bist100") || textLower.includes("xu100")) {
      return { path: "/endeksler/bist100", context: "endeks:bist100" };
    }
    if (textLower.includes("bist 30") || textLower.includes("bist30") || textLower.includes("xu030")) {
      return { path: "/endeksler/bist30", context: "endeks:bist30" };
    }
    if (textLower.includes("bist 500") || textLower.includes("bist500") || textLower.includes("xu500")) {
      return { path: "/endeksler/bist500", context: "endeks:bist500" };
    }
    if (textLower.includes("bankacılık") || textLower.includes("bist banka") || textLower.includes("xbank") || textLower.includes("bistbanka")) {
      return { path: "/endeksler/bistbanka", context: "endeks:bistbanka" };
    }

    const words = textLower.match(/[a-zA-Z0-9]+/g) || [];
    for (const w of words) {
      const upperWord = w.toUpperCase();
      if (upperWord.length >= 3 && upperWord.length <= 6 && upperWord in companyNames) {
        const slug = tickerToSectorSlug[upperWord] || 'diger';
        return { path: `/sektorler/${slug}/${w.toLowerCase()}`, context: `sirket:${w.toLowerCase()}` };
      }
    }
    return null;
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      if (!sessionLoading) {
        navigate({ to: "/login" as any });
      }
      return;
    }

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const currentPath = location.pathname.toLowerCase();
    const isGlobalHome = currentPath === "/" || context === "global";
    
    if (isGlobalHome) {
      const target = detectTargetAsset(textToSend);
      if (target) {
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
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  };

  const handleFocus = () => {
    // Scroll textarea into view on mobile when focused
    if (textareaRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300); // Delay for keyboard animation
    }
  };

  return (
    <div className={`flex items-end gap-2 bg-transparent px-5 py-4 w-full select-none ${className}`}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        disabled={isLoading}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-base text-foreground placeholder-muted-foreground/50 disabled:opacity-50 min-h-[44px] max-h-[140px] font-sans leading-relaxed touch-manipulation [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      />

      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-20 transition-all cursor-pointer shadow-sm shrink-0 self-end hover:brightness-110 active:scale-90 touch-manipulation"
        title="Gönder"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
