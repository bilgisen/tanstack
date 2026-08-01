import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ANON_QUOTA_DAILY, getAnonQuota, useChatStore } from "../../store/chat";
import { CompanySearch } from "../chat/CompanySearch";
import { useAuth } from "../../hooks/useAuth";
import { INDEX_CODES } from "../../lib/marketTickers";
import { useUIStore } from "../../store/ui";
import type { UserProfile } from "../../hooks/useAuth";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
  user?: UserProfile | null;
  sessionLoading?: boolean;
}

/** Known index codes for direct page navigation — shared via lib/marketTickers */

/** Names that map to index codes */
const INDEX_NAME_MAP: Record<string, string> = {
  'BIST 30':'XU030','BIST 50':'XU050','BIST 100':'XU100',
  'bist 30':'XU030','bist 50':'XU050','bist 100':'XU100',
};

export function ChatPane({
  context = "global",
  placeholder = "Bir soru sorun...",
  className = "",
  user,
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { isLoading, sendMessage, setUserTier } = useChatStore();
  const { globalPrompt, setGlobalPrompt } = useUIStore();
  const navigate = useNavigate();

  const { user: authUser } = useAuth();
  const effectiveUser = user || authUser;
  // Hydration-safe: default false so server & first client render match, then compute after mount
  const [anonQuotaExhausted, setAnonQuotaExhausted] = useState(false);

  useEffect(() => {
    setUserTier(effectiveUser?.tier || 'free');
  }, [effectiveUser?.tier, setUserTier]);

  useEffect(() => {
    setAnonQuotaExhausted(!effectiveUser && getAnonQuota() >= ANON_QUOTA_DAILY);
  }, [effectiveUser]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Check if the text looks like a pure ticker/index navigation request
   * vs a natural language question for the AI.
   */
  const isNavigationIntent = (text: string): string | null => {
    const trimmed = text.trim()
    if (!trimmed || trimmed.includes('?') || trimmed.includes('nedir') || trimmed.includes('nasıl')) return null

    const upper = trimmed.toUpperCase()

    // Direct index code
    if (INDEX_CODES.has(upper)) return `/endeksler/${upper.toLowerCase()}`

    // Index name mapping
    if (INDEX_NAME_MAP[trimmed] || INDEX_NAME_MAP[upper]) {
      const code = (INDEX_NAME_MAP[trimmed] || INDEX_NAME_MAP[upper])
      return `/endeksler/${code.toLowerCase()}`
    }

    // Single word 3-5 char ticker (stock code)
    if (/^[A-Z0-9ÇŞĞÜÖİ]{3,5}$/.test(upper) && !upper.startsWith('X')) {
      return `/hisse/${upper.toLowerCase()}`
    }

    // Two-word index names
    if (/^BIST\s+\d{2,3}$/i.test(trimmed)) {
      const num = trimmed.replace(/\D/g, '')
      const map: Record<string, string> = { '30':'xu030', '50':'xu050', '100':'xu100' }
      if (map[num]) return `/endeksler/${map[num]}`
    }

    return null
  }

  const sendText = useCallback(async (text: string) => {
    if (!text || isLoading) return;
    setInput("");
    setShowSearch(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(text, context);
  }, [isLoading, sendMessage, context]);

  // Consume global prompts (CommandPalette, ChatStarter badges) as chat questions
  useEffect(() => {
    if (globalPrompt) {
      const prompt = globalPrompt;
      setGlobalPrompt(null);
      sendText(prompt);
    }
  }, [globalPrompt, setGlobalPrompt, sendText]);

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return

    // If input looks like a pure ticker/index navigation, navigate instead of asking AI
    const navPath = isNavigationIntent(text)
    if (navPath) {
      setInput("")
      setShowSearch(false)
      navigate({ to: navPath } as any)
      return
    }

    sendText(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // If search results are visible and last word matches a ticker, navigate directly
      const lastWord = input.trim().split(/\s+/).pop() || "";
      const navPath = isNavigationIntent(lastWord);
      if (navPath) {
        setInput("");
        setShowSearch(false);
        navigate({ to: navPath } as any);
        return;
      }
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const val = textarea.value;
    setInput(val);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    const lastWord = val.trim().split(/\s+/).pop() || "";
    setShowSearch(lastWord.length >= 2 && !val.endsWith("?"));
  };

  const handleFocus = () => {
    if (textareaRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    const navPath = isNavigationIntent(ticker);
    if (navPath) {
      setInput("");
      setShowSearch(false);
      navigate({ to: navPath } as any);
      return;
    }
    const parts = input.trim().split(/\s+/);
    parts[parts.length - 1] = ticker;
    setInput(parts.join(" ") + " ");
    setShowSearch(false);
    textareaRef.current?.focus();
  };

  const handleAskAI = (ticker: string) => {
    setShowSearch(false);
    sendText(`${ticker} hakkında güncel analiz ve özet ver.`);
  };

  return (
    <div className={`relative flex flex-col w-full select-none ${className}`}>
      {showSearch && (
        <CompanySearch
          query={input.trim().split(/\s+/).pop() || ""}
          onSelect={handleSelectTicker}
          onAskAI={handleAskAI}
          onClose={() => setShowSearch(false)}
        />
      )}

      <div className="flex items-end gap-2 bg-transparent px-5 py-4 w-full">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={isLoading || anonQuotaExhausted}
          placeholder={anonQuotaExhausted ? "Ücretsiz soru hakkınız doldu" : placeholder}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-base text-foreground placeholder-muted-foreground/50 disabled:opacity-50 min-h-[44px] max-h-[140px] font-sans leading-relaxed touch-manipulation [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || anonQuotaExhausted}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-20 transition-all cursor-pointer shadow-sm shrink-0 self-end hover:brightness-110 active:scale-90 touch-manipulation"
          title="Gönder"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
