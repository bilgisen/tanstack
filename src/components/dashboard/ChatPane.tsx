import { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { useNavigate, useLocation } from "@tanstack/react-router";
import companyNames from "../../constants/companyNames.json";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import { signIn } from "../../lib/auth-client";

interface ChatPaneProps {
  context?: string;
  placeholder?: string;
  className?: string;
  user?: any;
}

export function ChatPane({
  context = "global",
  placeholder = "Bir soru sorun...",
  className = "",
  user,
}: ChatPaneProps) {
  const [input, setInput] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isLoading, sendMessage, clearChat } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const detectTargetAsset = (text: string): { path: string; context: string } | null => {
    const textLower = text.toLowerCase();
    
    // Check indices first
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

    // Anonim kullanıcı ise dialog göster
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

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

  const handleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/panel`,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 bg-transparent px-6 py-2 w-full select-none ${className}`}>
        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-base md:text-lg text-foreground placeholder-muted-foreground/50 disabled:opacity-50 min-h-[48px] max-h-[140px] font-sans leading-relaxed custom-scrollbar"
        />

        {/* Revolut Cobalt Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-20 transition-all cursor-pointer shadow-sm shrink-0 self-center hover:brightness-110 active:scale-90"
          title="Gönder"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Auth Dialog for Anonymous Users */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl font-semibold">
              Ücretsiz Devam Etmek İçin Bağlanın
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2 pb-4">
              Chatbot'u kullanmak ve analizlerden faydalanmak için Google hesabınızla giriş yapın.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col gap-3 pt-2">
            {/* Google Login Button */}
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white text-[#191c1f] font-semibold hover:bg-[#f4f4f4] active:scale-95 transition-all text-sm cursor-pointer shadow-md border border-border/20 w-full"
            >
              {/* Google Icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
                <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
                <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
              </svg>
              Google'la Devam Et
            </button>

            {/* Fine Print */}
            <p className="text-xs text-center text-muted-foreground/70">Kredi kartı gerekmez • Tamamen ücretsiz</p>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

