import { useEffect, useMemo, useRef, useState } from "react";
import { History, Loader2, Maximize2, Minimize2, Plus, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useChatStore } from "../../store/chat";
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
import { SuggestionChips } from "./SuggestionChips";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { getPageSuggestions } from "../../lib/pageContextSuggestions";
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

  const pageCtx = useMemo(() => getPageSuggestions(context), [context]);

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
        <span className="text-sm font-normal text-foreground">Araştır</span>
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
            } as React.CSSProperties : undefined}
          >
            <MessageScrollerContent className={`${isMobile ? "gap-3 p-3" : "gap-4 p-5"}`}>
              {messages.length === 0 ? (
                <MessageScrollerItem className={`flex items-start justify-center ${isMobile ? "min-h-[200px] pt-1" : "min-h-[300px] pt-2"}`}>
                  <div className={`flex flex-col items-center text-center select-none w-full ${
                    isMobile ? "p-3 pb-2 space-y-1" : "p-4 sm:p-6 pb-4 space-y-2 max-w-md mx-auto"
                  }`}>
                    <Logo size={isMobile ? 24 : 32} variant="icon" />
                    <div className="space-y-0.5 mt-0.5">
                      <h6 className={`font-semibold text-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                        {pageCtx.title}
                      </h6>
                      <p className={`text-muted-foreground leading-relaxed ${isMobile ? "text-[10px]" : "text-xs"}`}>
                        {pageCtx.description}
                      </p>
                    </div>
                    <div className="w-full space-y-2">
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
                  </div>
                </MessageScrollerItem>
              ) : (
                messages.map((msg, idx) => (
                  <MessageScrollerItem key={idx}>
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
          user={user}
          sessionLoading={sessionLoading}
        />
      </div>
    </div>
  );
}
