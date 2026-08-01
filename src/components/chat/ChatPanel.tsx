import { useEffect, useMemo, useRef, useState } from "react";
import { History, Loader2, Maximize2, Minimize2, Plus, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ANON_QUOTA_DAILY, getAnonQuota, useChatStore } from "../../store/chat";
import { useUIStore } from "../../store/ui";
import { ChatPane } from "../dashboard/ChatPane";
import { MarkdownRenderer } from "../dashboard/MarkdownRenderer";
import { Logo } from "../layout/Logo";
import { Bubble, BubbleContent } from "../ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../ui/message-scroller";
import { getPageSuggestions } from "../../lib/pageContextSuggestions";
import { authClient } from "../../lib/auth-client";
import { useAuth } from "../../hooks/useAuth";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { SuggestionChips } from "./SuggestionChips";
import type { UserProfile } from "../../hooks/useAuth";

interface ChatPanelProps {
  context: string;
  placeholder?: string;
  onClose?: () => void;
  user?: UserProfile | null;
  sessionLoading?: boolean;
  isMobile?: boolean; // For mobile-specific scrollbar hiding
}

export function ChatPanel({ context, placeholder, onClose, user, sessionLoading, isMobile = false }: ChatPanelProps) {
  const { messages, isLoading, streamingText, sessions, activeSessionId, loadSession, deleteSession, clearChat, init, sendMessage } = useChatStore();
  const { isChatMaximized, toggleChatMaximized, openRightSidebar } = useUIStore();
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user: authUser, loading: authLoading } = useAuth();
  const effectiveUser = user ?? authUser;
  const effectiveSessionLoading = sessionLoading ?? authLoading;
  const isAnon = !effectiveUser && !effectiveSessionLoading;

  const pageCtx = useMemo(() => getPageSuggestions(context), [context]);

  // Auto-scroll viewport to bottom on streaming token updates or new messages
  const viewportRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = document.querySelector<HTMLDivElement>('[data-slot="message-scroller-viewport"]')
    viewportRef.current = el
    if (el && (isLoading || streamingText !== null)) {
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
    }
  }, [streamingText, messages.length, isLoading])

  // Auto-clear chat when navigating to a different base context (e.g. sirket:THYAO → sirket:KCHOL)
  // ONLY if no active streaming
  const prevBaseCtx = useRef('')
  const baseCtx = useMemo(() => {
    const parts = context.split(':')
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : context
  }, [context])
  useEffect(() => {
    if (!prevBaseCtx.current) { prevBaseCtx.current = baseCtx; return }
    if (prevBaseCtx.current !== baseCtx && messages.length > 0 && !isLoading && streamingText === null) {
      prevBaseCtx.current = baseCtx
      clearChat()
    }
    prevBaseCtx.current = baseCtx
  }, [baseCtx, isLoading, streamingText])

  // Smart navigation: some suggestions imply a page/tab change
  const tryNavigateFromSuggestion = (question: string) => {
    const q = question.toLowerCase()
    const isSirket = context.startsWith("sirket:")
    const parts = context.split(":")
    const ticker = parts[1]?.toLowerCase() || ""
    const currentSubpage = parts[2] || "genel-bakis"

    // Handle endeks navigation
    if (context.startsWith("endeks:")) {
      const endeksId = parts[1]?.toLowerCase() || ""
      if (q.includes("teknik") && endeksId) {
        navigate({ to: `/endeksler/${endeksId}/teknik-analiz` } as any)
      }
      return
    }

    if (!isSirket || !ticker) return

    let targetSubpage = ""
    if (q.includes("teknik analiz")) targetSubpage = "teknik-analiz"
    else if (q.includes("finansal analiz") || q.includes("rasyo") || q.includes("temel")) targetSubpage = "temel-analiz"
    else if (q.includes("bilanço") || q.includes("tablo")) targetSubpage = "tablolar"
    else if (q.includes("sektör") || q.includes("sektordeki")) targetSubpage = "sektor"

    // Only navigate if the target is different from current
    if (targetSubpage && targetSubpage !== currentSubpage) {
      navigate({ to: `/hisse/${ticker}/${targetSubpage}` } as any)
    }
  }

  const handleSuggestionClick = async (q: string) => {
    if (isLoading) return;
    tryNavigateFromSuggestion(q);
    openRightSidebar();
    await sendMessage(q, context);
  };

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background relative font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* 1. Header - Fixed height, no shrink */}
      <div
        className={`flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-md flex-shrink-0 select-none z-10 relative ${
          isMobile ? "h-11 px-3" : "h-14 px-5"
        }`}
        ref={historyRef}
      >
        <div className="flex items-center gap-1.5">
          <Logo size={isMobile ? 16 : 20} variant="icon" />
          <span className="text-sm font-normal text-foreground">Araştır</span>
        </div>
        {context !== 'global' && (
          <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider truncate max-w-[40%] select-none">
            {pageCtx.title}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => clearChat()}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title="Yeni Sohbet"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
              historyOpen
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            title="Sohbet Geçmişi"
          >
            <History size={16} />
          </button>

          <button
            onClick={toggleChatMaximized}
            className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer items-center justify-center active:scale-95"
            title={isChatMaximized ? "Sohbeti Küçült" : "Sohbeti Genişlet"}
          >
            {isChatMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              title="Kapat"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* History Dropdown */}
        {historyOpen && (
          <div className="absolute right-5 top-12 w-64 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider px-3 pb-2 pt-1.5 border-b border-border/30 mb-1">
              Geçmiş Sohbetler
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground/60 italic text-center">
                  Sohbet geçmişi bulunmuyor.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      session.id === activeSessionId
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      loadSession(session.id);
                      setHistoryOpen(false);
                    }}
                  >
                    <span className="truncate pr-2 select-none">
                      {session.ticker || "Genel"} Analizi
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                      title="Sil"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Messages Area - Flex grow with proper MessageScroller */}
      <MessageScrollerProvider>
        <MessageScroller className="flex-1 min-h-0">
          <MessageScrollerViewport 
            className="h-full"
            style={isMobile ? {
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            } : undefined}
          >
            <MessageScrollerContent className={`${isMobile ? "gap-3 p-3" : "gap-4 p-5"}`}>
              {messages.length === 0 ? (
                <MessageScrollerItem className={`flex items-start ${isMobile ? "min-h-[200px] pt-1" : "min-h-[300px] pt-2"}`}>
                  <div className="flex flex-col items-start text-left select-none w-full">
                    <div className="space-y-1">
                      <h6 className={`font-semibold text-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                        {pageCtx.title}
                      </h6>
                      <p className={`text-muted-foreground leading-relaxed ${isMobile ? "text-[10px]" : "text-xs sm:text-sm"}`}>
                        {pageCtx.description}
                      </p>
                    </div>
                    {!isAnon && (
                      <div className="w-full space-y-2 mt-4">
                        <SuggestionChips
                          suggestions={pageCtx.suggestions}
                          onSelect={handleSuggestionClick}
                          max={isMobile ? 3 : 4}
                        />
                        <CapabilitiesSection
                          capabilities={pageCtx.capabilities}
                          onSelect={handleSuggestionClick}
                        />
                      </div>
                    )}
                  </div>
                </MessageScrollerItem>
              ) : (
                messages.map((msg, idx) => (
                  <MessageScrollerItem key={idx} scrollAnchor={idx === messages.length - 1}>
                    <div className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="shrink-0 mt-0.5">
                          <Logo size={isMobile ? 18 : 22} variant="icon" />
                        </div>
                      )}

                      <Bubble
                        variant={msg.role === "user" ? "default" : "secondary"}
                        align={msg.role === "user" ? "end" : "start"}
                      >
                        <BubbleContent
                          className={`${isMobile ? "px-2.5 py-2" : "px-3.5 py-2.5"} rounded-2xl ${
                            msg.role === "user"
                              ? "rounded-tr-sm"
                              : "rounded-tl-sm border border-border/30"
                          }`}
                        >
                          <MarkdownRenderer
                            text={msg.text}
                            isAssistant={msg.role === "assistant"}
                            context={msg.context || context}
                            suggestions={msg.suggestions}
                            widget={msg.widget}
                          />
                        </BubbleContent>
                      </Bubble>
                    </div>
                  </MessageScrollerItem>
                ))
              )}

              {streamingText !== null && (
                <MessageScrollerItem scrollAnchor>
                  <div className="flex gap-2 justify-start">
                    <div className="shrink-0 mt-0.5">
                      <Logo size={isMobile ? 18 : 22} variant="icon" />
                    </div>
                    <Bubble variant="secondary" align="start">
                      <BubbleContent className={`${isMobile ? "px-2.5 py-2" : "px-3.5 py-2.5"} rounded-2xl rounded-tl-sm border border-border/30`}>
                        <div className={`whitespace-pre-wrap break-words leading-relaxed ${isMobile ? "text-xs" : "text-sm"} [&_*]:text-sm`}>
                          {streamingText}
                          <span className="inline-flex w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse rounded-sm" />
                        </div>
                      </BubbleContent>
                    </Bubble>
                  </div>
                </MessageScrollerItem>
              )}

              {isLoading && streamingText === null && (
                <MessageScrollerItem scrollAnchor>
                  <div className="flex gap-2 justify-start">
                    <div className="shrink-0 mt-0.5">
                      <Logo size={isMobile ? 18 : 22} variant="icon" />
                    </div>
                    <Bubble variant="muted" align="start">
                      <BubbleContent className={`${isMobile ? "px-2.5 py-2" : "px-3.5 py-2.5"} rounded-2xl rounded-tl-sm border border-border/30 flex items-center gap-2`}>
                        <Loader2 size={isMobile ? 11 : 13} className="animate-spin text-primary" />
                        <span className={`text-muted-foreground ${isMobile ? "text-[11px]" : "text-sm"}`}>
                          Analiz raporu hazırlıyor...
                        </span>
                      </BubbleContent>
                    </Bubble>
                  </div>
                </MessageScrollerItem>
              )}

              {/* Anonymous user login CTA after daily quota reached (seamless, no card) */}
              {isAnon && !isLoading && streamingText === null && getAnonQuota() >= ANON_QUOTA_DAILY && (
                <MessageScrollerItem scrollAnchor>
                  <div className="flex flex-col items-start gap-1.5 my-1.5 select-none">
                    <p className="text-xs text-muted-foreground">
                      Ücretsiz olarak kullanmaya devam etmek için
                    </p>
                    <button
                      type="button"
                      onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.href })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="currentColor"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                      </svg>
                      <span>Google'la bağlanın</span>
                    </button>
                  </div>
                </MessageScrollerItem>
              )}

              <MessageScrollerItem scrollAnchor>
                <div className="h-4" />
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>

          {/* Scroll to bottom button - hidden on mobile to save space */}
          <MessageScrollerButton direction="end" className="hidden md:flex" />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* 3. Input Footer - Fixed height, no shrink */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background">
        <ChatPane
          context={context}
          placeholder={placeholder}
          className="w-full"
          user={effectiveUser}
          sessionLoading={effectiveSessionLoading}
        />
      </div>
    </div>
  );
}
