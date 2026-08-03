import { create } from 'zustand';
import { useWatchlistStore } from './watchlist';

interface MarketCache {
  data: Record<string, { price: number; change: number }>;
  ts: number;
}

declare global {
  interface Window {
    __chat_market_prices_cache?: MarketCache;
  }
}

export type Message = {
  role: "user" | "assistant";
  text: string;
  context?: string;
  suggestions?: Array<string>;
  widget?: {
    type: 'comparison' | 'ratio_chart' | 'calculator';
    title: string;
    data: Record<string, unknown>;
  } | null;
};

export interface ChatSession {
  id: string;
  ticker: string;
  code: string;
  date: string;
  messages: Array<Message>;
  context: string;
}

interface ChatState {
  messages: Array<Message>;
  isLoading: boolean;
  streamingText: string | null;
  sessions: Array<ChatSession>;
  activeSessionId: string | null;
  selectedModelId: string;
  initialized: boolean;
  userTier: string;
  setSelectedModelId: (modelId: string) => void;
  setUserTier: (tier: string) => void;
  sendMessage: (text: string, context: string) => Promise<void>;
  clearChat: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  init: () => Promise<void>;
}

const generateShortCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const loadSessionsFromStorage = (): Array<ChatSession> => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('hissepro_chat_sessions');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load chat sessions from localStorage:", e);
    return [];
  }
};

const saveSessionsToStorage = (sessions: Array<ChatSession>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hissepro_chat_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save chat sessions to localStorage:", e);
  }
};

let cachedSessionToken: string | null = null;

async function getSessionToken(): Promise<string | null> {
  if (cachedSessionToken !== null) return cachedSessionToken;
  try {
    const res = await fetch('/api/ai/session-token');
    if (!res.ok) return null;
    const data = await res.json();
    cachedSessionToken = data.token || null;
    return cachedSessionToken;
  } catch {
    return null;
  }
}

const ANON_QUOTA_KEY = 'jb_anon_questions'
export const ANON_QUOTA_DAILY = 3

export function getAnonQuota(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(ANON_QUOTA_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    if (parsed?.date !== getTodayDate()) return 0
    return typeof parsed.count === 'number' ? parsed.count : 0
  } catch {
    return 0
  }
}

function incrementAnonQuota(): void {
  try {
    localStorage.setItem(ANON_QUOTA_KEY, JSON.stringify({ date: getTodayDate(), count: getAnonQuota() + 1 }))
  } catch {}
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  streamingText: null,
  sessions: loadSessionsFromStorage(),
  activeSessionId: null,
  selectedModelId: "gemini-2.5-flash-lite",
  initialized: false,
  userTier: 'free',

  setSelectedModelId: (modelId: string) => set({ selectedModelId: modelId }),

  setUserTier: (tier: string) => {
    const state = get()
    const newModel = tier !== 'free' && state.selectedModelId === 'gemini-2.5-flash-lite'
      ? 'gemini-2.5-flash'
      : state.selectedModelId
    set({ userTier: tier, selectedModelId: newModel })
  },

  clearChat: () => set({ messages: [], activeSessionId: null }),

  init: async () => {
    if (get().initialized) return
    try {
      const res = await fetch('/api/chat/sessions?limit=50')
      if (res.ok) {
        const data = await res.json()
        const remoteSessions: Array<ChatSession> = (data.sessions || []).map((s: { id: string; ticker?: string; createdAt: string; context?: string }) => ({
          id: s.id,
          ticker: s.ticker || 'GLOBAL',
          code: s.id.slice(0, 3).toUpperCase(),
          date: new Date(s.createdAt).toISOString().slice(0, 10),
          messages: [],
          context: s.context || '',
        }))
        // Merge: remote sessions first, then local-only sessions (not yet saved to server)
        const localIds = new Set(get().sessions.map(s => s.id))
        const merged = [
          ...remoteSessions,
          ...get().sessions.filter(s => !localIds.has(s.id))
        ]
        set({ sessions: merged, initialized: true })
        saveSessionsToStorage(merged)
      } else {
        // Anonymous or unauthenticated: keep local-only sessions, mark init done
        set({ initialized: true })
      }
    } catch {
      set({ initialized: true })
    }
  },

  loadSession: async (id: string) => {
    const local = get().sessions.find(s => s.id === id)
    if (!local) return

    // Try to get messages from server first
    try {
      const res = await fetch(`/api/chat/sessions/${id}`)
      if (res.ok) {
        const data = await res.json()
        const serverMessages: Array<Message> = (data.session?.messages || []).map((m: { role: 'user' | 'assistant'; text: string; context?: string; suggestions?: Array<string>; widget?: Record<string, unknown> }) => ({
          role: m.role,
          text: m.text,
          context: m.context || undefined,
          suggestions: m.suggestions || undefined,
          widget: m.widget || undefined,
        }))
        if (serverMessages.length > 0) {
          local.messages = serverMessages
        }
      }
    } catch {
      // fallback to local messages
    }

    set({
      activeSessionId: id,
      messages: local.messages,
    })
  },

  deleteSession: async (id: string) => {
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
    } catch {}
    const updatedSessions = get().sessions.filter(s => s.id !== id)
    set({ sessions: updatedSessions })
    saveSessionsToStorage(updatedSessions)

    if (get().activeSessionId === id) {
      set({ activeSessionId: null, messages: [] })
    }
  },

  sendMessage: async (text: string, context: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || get().isLoading) return;

    let currentSessionId = get().activeSessionId;
    let currentSessions = [...get().sessions];
    let currentSession = currentSessions.find(s => s.id === currentSessionId);

    let isNewSession = false

    // If no active session, create a new one
    if (!currentSession) {
      isNewSession = true
      let ticker = "GLOBAL";
      if (context.startsWith("sirket:")) {
        ticker = context.split(":")[1].toUpperCase();
      } else if (context.startsWith("endeks:")) {
        ticker = context.split(":")[1].toUpperCase();
      }

      currentSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      currentSession = {
        id: currentSessionId,
        ticker,
        code: generateShortCode(),
        date: getTodayDate(),
        messages: [],
        context
      };

      currentSessions = [currentSession, ...currentSessions];
    }

    const newUserMessage: Message = { role: "user", text: trimmedText, context };
    
    // Update local state and current session messages
    currentSession.messages = [...currentSession.messages, newUserMessage];
    
    set({
      activeSessionId: currentSessionId,
      messages: currentSession.messages,
      sessions: currentSessions,
      isLoading: true
    });
    saveSessionsToStorage(currentSessions);

    // Anonymous quota: limited free questions per day, then require login
    if (!(await getSessionToken())) {
      if (getAnonQuota() >= ANON_QUOTA_DAILY) {
        const quotaAssistantMessage: Message = {
          role: "assistant",
          text: "Ücretsiz soru hakkınız doldu. Devam etmek için lütfen giriş yapın.",
          context,
        };

        currentSession.messages = [...currentSession.messages, quotaAssistantMessage];
        set({
          activeSessionId: currentSessionId,
          sessions: currentSessions.map(s => s.id === currentSessionId ? { ...s, messages: currentSession.messages } : s),
          messages: [...get().messages, quotaAssistantMessage],
          isLoading: false
        });
        saveSessionsToStorage(currentSessions);
        return;
      }
      incrementAnonQuota()
    }

    // Monetization: Pre-Check balance and tier access
    const selectedModelId = get().selectedModelId || 'gemini-2.5-flash-lite';
    let reservedCost = 0;
    const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    try {
      const preCheckRes = await fetch("/api/ai/pre-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModelId,
          estimatedInputTokens: Math.ceil(trimmedText.length / 4) + 1500,
          estimatedOutputTokens: 500
        })
      });

      if (preCheckRes.ok) {
        const preCheckData = await preCheckRes.json();
        if (preCheckData.ok) {
          reservedCost = preCheckData.estimatedCost || 0;
        }
        if (!preCheckData.ok) {
          let errorMsg = "";
          if (preCheckData.error === 'MODEL_NOT_ALLOWED') {
            errorMsg = `Seçtiğiniz model olan **${selectedModelId.toUpperCase()}** bu abonelik paketinde kullanılamamaktadır. Lütfen [Profil ve Abonelik Paneli](/profil) sayfasından paketinizi yükseltin.`;
          } else if (preCheckData.error === 'INSUFFICIENT_HT') {
            const availableHT = preCheckData.availableHT || 0;
            errorMsg = `Yetersiz Jet Token bakiyesi! Mevcut bakiyeniz: **${availableHT.toLocaleString()} Jet Token**. Chatbot'u kullanmaya devam edebilmek için lütfen [Profil ve Abonelik Paneli](/profil) sayfasından paketinizi yükseltin veya ek kredi satın alın.`;
          } else if (preCheckData.error === 'DAILY_LIMIT') {
            errorMsg = "Günlük kullanım limitinize ulaştınız. Sınırsız kullanım için lütfen [Profil ve Abonelik Paneli](/profil) sayfasından paketinizi yükseltin.";
          } else if (preCheckData.error === 'USER_NOT_FOUND') {
            errorMsg = "Kullanıcı bilgileriniz bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin. Sorun devam ederse [Profil ve Abonelik Paneli](/profil) sayfasını kontrol edin.";
          } else {
            errorMsg = "Sorgunuz şu anda işlenemiyor. Lütfen sayfayı yenileyip tekrar deneyin.";
          }

          const errorAssistantMessage: Message = {
            role: "assistant",
            text: errorMsg,
            context
          };

          currentSession.messages = [...currentSession.messages, errorAssistantMessage];
          set({
            sessions: currentSessions.map(s => s.id === currentSessionId ? { ...s, messages: currentSession.messages } : s),
            messages: [...get().messages, errorAssistantMessage],
            isLoading: false
          });
          saveSessionsToStorage(currentSessions);
          return;
        }
      }
    } catch (e) {
      console.error("Monetization precheck failed:", e);
    }

    // Fetch latest prices for all stocks and indices to enrich context dynamically
    // Client-side cache: only re-fetch if stale (>60s old)
    // NOTE: runs in the background — the stream request is NOT blocked on this,
    // so watchlist prices may be absent for the first message after cache expiry.
    let marketItemsMap: Record<string, { price: number; change: number }> = {};

    const cachedPrices = window.__chat_market_prices_cache;
    const cacheAge = cachedPrices ? Date.now() - cachedPrices.ts : Infinity;

    if (cachedPrices && cacheAge < 60000) {
      marketItemsMap = cachedPrices.data;
    } else {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.jetborsa.com";
      const pricesPromise = (async () => {
        const [stocksRes, summaryRes] = await Promise.allSettled([
          fetch(`${apiUrl}/api/market/stocks`),
          fetch(`${apiUrl}/api/market/summary`)
        ]);

        if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
          const json = await stocksRes.value.json();
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach((stock: { code: string; last_price?: number; diff_percent?: number }) => {
              marketItemsMap[stock.code.toUpperCase()] = {
                price: stock.last_price || 0,
                change: stock.diff_percent || 0
              };
            });
          }
        }
        if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
          const json = await summaryRes.value.json();
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach((index: { code: string; last_price?: number; diff_percent?: number }) => {
              marketItemsMap[index.code.toUpperCase()] = {
                price: index.last_price || 0,
                change: index.diff_percent || 0
              };
            });
          }
        }
        window.__chat_market_prices_cache = { data: marketItemsMap, ts: Date.now() };
      })();
      pricesPromise.catch((e) => {
        if (cachedPrices) {
          marketItemsMap = cachedPrices.data; // fallback to stale cache
        }
        console.error("Failed to fetch current market prices for chatbot context:", e);
      });
    }

    // Build watchlist data as a structured object for the AI
    const watchlists = useWatchlistStore.getState().watchlists;
    const activeWatchlistId = useWatchlistStore.getState().activeWatchlistId;
    const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
    
    const watchlistPayload = activeWatchlist ? {
      name: activeWatchlist.name,
      items: activeWatchlist.items.map(i => {
        const live = marketItemsMap[i.symbol.toUpperCase()];
        return {
          symbol: i.symbol,
          type: i.type,
          price: live?.price || null,
          change: live?.change || null,
        };
      }),
    } : null;

    // Build message history for multi-turn context (last 10 exchanges)
    const historyMessages = get().messages
      .slice(-20) // last 20 messages = ~10 user + ~10 assistant
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, text: m.text }))

    try {
      // Don't set streamingText here — let it stay null until first token arrives
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.jetborsa.com";

      // Send real Better Auth session token as Authorization header
      const sessionToken = await getSessionToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const response = await fetch(`${apiUrl}/api/ai/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: trimmedText,
          context,
          watchlist: watchlistPayload,
          history: historyMessages,
        }),
      });

      if (!response.ok) throw new Error("API response error");

      // Consume SSE stream
      let replyText = "";
      let dataSuggestions: Array<string> = [];
      let dataWidget: { type: 'comparison' | 'ratio_chart' | 'calculator'; title: string; data: Record<string, unknown> } | null = null;
      let usage: { inputTokens?: number; outputTokens?: number } = {};

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'token') {
                replyText += event.text;
                if (get().streamingText === null) {
                  set({ streamingText: '' });
                }
                set({ streamingText: replyText });
              } else if (event.type === 'done') {
                replyText = event.reply || replyText;
                dataSuggestions = event.suggestions || [];
                dataWidget = event.widget || null;
                if (event.usage) usage = event.usage;
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
      // Monetization: Charge HT (streamingText stays until message is appended)
      try {
        await fetch("/api/ai/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: selectedModelId,
            inputTokens: usage?.inputTokens || (Math.ceil(trimmedText.length / 4) + 1000),
            outputTokens: usage?.outputTokens || (replyText ? Math.ceil(replyText.length / 4) : 250),
            reservedCost,
            requestId,
            sessionId: currentSessionId,
            featureType: "chat"
          })
        });

        // Fire custom event to update credits display in UI instantly
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ht-balance-updated"));
        }
      } catch (e) {
        console.error("Monetization charge failed:", e);
      }

      // Strip [NAVIGATE:...] tags from text — NO automatic navigation (user-initiated only)
      replyText = replyText.replace(/\[NAVIGATE:[^\]]*\]/gi, '').trim();

      // Parse and execute potential WATCHLIST_ADD action
      const addMatch = replyText.match(/\[WATCHLIST_ADD:(.*?):(.*?)\]/);
      if (addMatch) {
        replyText = replyText.replace(addMatch[0], "").trim();
        const symbol = addMatch[1].toUpperCase();
        const type = addMatch[2].toLowerCase() === 'index' ? 'index' : 'stock';
        const activeId = useWatchlistStore.getState().activeWatchlistId || 'default-list';
        useWatchlistStore.getState().addItem(activeId, symbol, type);
      }

      // Parse and execute potential WATCHLIST_REMOVE action
      const removeMatch = replyText.match(/\[WATCHLIST_REMOVE:(.*?)\]/);
      if (removeMatch) {
        replyText = replyText.replace(removeMatch[0], "").trim();
        const symbol = removeMatch[1].toUpperCase();
        const activeId = useWatchlistStore.getState().activeWatchlistId || 'default-list';
        useWatchlistStore.getState().removeItem(activeId, symbol);
      }

      const newAssistantMessage: Message = { 
        role: "assistant", 
        text: replyText, 
        context,
        suggestions: dataSuggestions,
        widget: dataWidget
      };

      // Update session with assistant reply
      const updatedSessions = get().sessions.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, newAssistantMessage]
          };
        }
        return s;
      });

      set({
        streamingText: null,
        sessions: updatedSessions,
        messages: [...get().messages, newAssistantMessage]
      });
      saveSessionsToStorage(updatedSessions);

      // Persist exchange to server
      try {
        await fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            ticker: currentSession?.ticker,
            context,
            title: isNewSession ? trimmedText.slice(0, 80) : undefined,
            userMessage: { text: trimmedText, context },
            assistantMessage: {
              text: replyText,
              suggestions: dataSuggestions,
              widget: dataWidget,
              inputTokens: usage?.inputTokens,
              outputTokens: usage?.outputTokens,
            },
          }),
        })
      } catch (e) {
        console.error('Failed to save chat to server:', e)
      }

    } catch (error) {
      console.error(error);
      set({ streamingText: null });
      const errorAssistantMessage: Message = {
        role: "assistant",
        text: "Özür dilerim, şu an yanıt üretemiyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
        context
      };

      const updatedSessions = get().sessions.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorAssistantMessage]
          };
        }
        return s;
      });

      set({
        sessions: updatedSessions,
        messages: [...get().messages, errorAssistantMessage]
      });
      saveSessionsToStorage(updatedSessions);

      try {
        await fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            ticker: currentSession?.ticker,
            context,
            userMessage: { text: trimmedText, context },
            assistantMessage: { text: errorAssistantMessage.text },
          }),
        })
      } catch {}
    } finally {
      set({ streamingText: null, isLoading: false });
    }
  },
}));
