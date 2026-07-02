import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useChatStore } from "../../store/chat";
import companyNames from "../../constants/companyNames.json";
import { signIn } from "../../lib/auth-client";

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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
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
        return { path: `/panel/sirketler/${w.toLowerCase()}`, context: `sirket:${w.toLowerCase()}` };
      }
    }
    return null;
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      if (!sessionLoading) {
        setShowAuthDialog(true);
      }
      return;
    }

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const currentPath = location.pathname.toLowerCase();
    const isGlobalHome = currentPath === "/panel" || currentPath === "/panel/" || context === "global";
    
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

  const handleLogin = async () => {
    setLoginInProgress(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/panel`,
      });
    } catch (err) {
      console.error("Login failed:", err);
      setLoginInProgress(false);
    }
  };

  return (
    <>
      <div className={`flex items-end gap-2 bg-transparent px-5 py-3 w-full select-none ${className}`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={isLoading}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-base text-foreground placeholder-muted-foreground/50 disabled:opacity-50 min-h-[44px] max-h-[140px] font-sans leading-relaxed custom-scrollbar"
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-20 transition-all cursor-pointer shadow-sm shrink-0 self-end hover:brightness-110 active:scale-90"
          title="Gönder"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Auth Dialog */}
      {showAuthDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              if (!loginInProgress) setShowAuthDialog(false);
            }}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-sm bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary" />

            <div className="px-6 pt-6 pb-7">
              {/* Close button */}
              {!loginInProgress && (
                <button
                  onClick={() => setShowAuthDialog(false)}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
                </svg>
              </div>

              {/* Text */}
              <h2 className="text-lg font-bold text-foreground text-center mb-1.5">
                Hoş Geldiniz
              </h2>
              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                Devam etmek için Google hesabınızla giriş yapın
              </p>

              {/* Google Login Button */}
              <button
                onClick={handleLogin}
                disabled={loginInProgress}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-[#1f1f1f] font-medium hover:bg-gray-50 active:scale-[0.98] transition-all text-sm cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border border-black/[0.06] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginInProgress ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                    <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
                    <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
                    <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
                  </svg>
                )}
                {loginInProgress ? "Yönlendiriliyor..." : "Google ile Giriş Yap"}
              </button>

              {/* Footer text */}
              <p className="text-[11px] text-muted-foreground/50 text-center mt-4">
                Kredi kartı gerekmez &middot; Tamamen ücretsiz
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
