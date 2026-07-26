import { useRef, useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { CompanySearch } from "../chat/CompanySearch";
import { authClient } from "../../lib/auth-client";
import { useAuth, type UserProfile } from "../../hooks/useAuth";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
  user?: UserProfile | null;
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
  const [showSearch, setShowSearch] = useState(false);
  const { isLoading, sendMessage, setUserTier } = useChatStore();

  // Fallback auth when user prop isn't passed (e.g. PublicPageLayout)
  const { user: authUser } = useAuth();
  const effectiveUser = user || authUser;

  // Sync user tier to chat store on mount/change
  useEffect(() => {
    setUserTier(effectiveUser?.tier || 'free');
  }, [effectiveUser?.tier, setUserTier]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    if (!effectiveUser && !sessionLoading) {
      handleLogin();
      return;
    }
    if (!effectiveUser) return;

    setInput("");
    setShowSearch(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    const val = textarea.value;
    setInput(val);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    // Show company search when typing potential company name (last word length >= 2)
    const lastWord = val.trim().split(/\s+/).pop() || "";
    setShowSearch(lastWord.length >= 2);
  };

  const handleFocus = () => {
    if (textareaRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    const parts = input.trim().split(/\s+/);
    parts[parts.length - 1] = ticker;
    setInput(parts.join(" ") + " ");
    setShowSearch(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={`relative flex flex-col w-full select-none ${className}`}>
      {/* Company Search Dropdown */}
      {showSearch && (
        <CompanySearch
          query={input.trim().split(/\s+/).pop() || ""}
          onSelect={handleSelectTicker}

        />
      )}

      <div className="flex items-end gap-2 bg-transparent px-5 py-4 w-full">
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
    </div>
  );
}
