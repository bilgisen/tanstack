import { create } from 'zustand';
import { useWatchlistStore } from './watchlist';

export type Message = {
  role: "user" | "assistant";
  text: string;
  context?: string;
};

export interface ChatSession {
  id: string;
  ticker: string;
  code: string;
  date: string;
  messages: Message[];
  context: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  sendMessage: (text: string, context: string) => Promise<void>;
  clearChat: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
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

const loadSessionsFromStorage = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('hissepro_chat_sessions');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load chat sessions from localStorage:", e);
    return [];
  }
};

const saveSessionsToStorage = (sessions: ChatSession[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hissepro_chat_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save chat sessions to localStorage:", e);
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  sessions: loadSessionsFromStorage(),
  activeSessionId: null,

  clearChat: () => set({ messages: [], activeSessionId: null }),

  loadSession: (id: string) => {
    const session = get().sessions.find(s => s.id === id);
    if (session) {
      set({
        activeSessionId: id,
        messages: session.messages
      });
    }
  },

  deleteSession: (id: string) => {
    const updatedSessions = get().sessions.filter(s => s.id !== id);
    set({ sessions: updatedSessions });
    saveSessionsToStorage(updatedSessions);

    if (get().activeSessionId === id) {
      set({ activeSessionId: null, messages: [] });
    }
  },

  sendMessage: async (text: string, context: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || get().isLoading) return;

    let currentSessionId = get().activeSessionId;
    let currentSessions = [...get().sessions];
    let currentSession = currentSessions.find(s => s.id === currentSessionId);

    // If no active session, create a new one
    if (!currentSession) {
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

    // Fetch latest prices for all stocks and indices to enrich context dynamically
    const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
    let marketItemsMap: Record<string, { price: number; change: number }> = {};
    
    try {
      const [stocksRes, summaryRes] = await Promise.allSettled([
        fetch(`${apiUrl}/api/market/stocks`),
        fetch(`${apiUrl}/api/market/summary`)
      ]);
      
      if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
        const json = await stocksRes.value.json();
        if (json.data && Array.isArray(json.data)) {
          json.data.forEach((stock: any) => {
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
          json.data.forEach((index: any) => {
            marketItemsMap[index.code.toUpperCase()] = {
              price: index.last_price || 0,
              change: index.diff_percent || 0
            };
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch current market prices for chatbot context:", e);
    }

    // Enrich context with active watchlists to feed Gemini AI with real-time price & performance data
    const watchlists = useWatchlistStore.getState().watchlists;
    const activeWatchlistId = useWatchlistStore.getState().activeWatchlistId;
    const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
    
    const watchlistsContext = watchlists.map(w => {
      const itemsStr = w.items.map(i => {
        const live = marketItemsMap[i.symbol.toUpperCase()];
        const priceStr = live 
          ? `son fiyat: ${live.price} TRY, günlük değişim: ${live.change >= 0 ? '+' : ''}${live.change.toFixed(2)}%` 
          : 'fiyat bilgisi alınamadı';
        return `${i.symbol} (${i.type === 'index' ? 'Endeks' : 'Hisse'} - ${priceStr})`;
      }).join(', ');
      return `"${w.name}" listesi: [${itemsStr || 'Boş'}]`;
    }).join('; ');

    const enrichedContext = `${context} | Aktif Liste: "${activeWatchlist?.name || 'Yok'}" | Tüm Takip Listeleri ve Güncel Fiyat/Değişim Verileri: ${watchlistsContext} | Desteklenen AI komutları: Bir hisseyi/endeksi takip listesine eklemek için cevabın sonuna [WATCHLIST_ADD:SEMBOL:hisse|endeks] veya çıkarmak için [WATCHLIST_REMOVE:SEMBOL] ekleyebilirsin. Örneğin: [WATCHLIST_ADD:THYAO:stock] veya [WATCHLIST_REMOVE:THYAO] veya [WATCHLIST_ADD:XU100:index].`;

    try {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedText,
          context: enrichedContext,
        }),
      });

      if (!response.ok) throw new Error("API response error");

      const data = await response.json();
      let replyText = data.reply || "Bir hata oluştu.";

      // Strip potential navigate matches
      const navigateMatch = replyText.match(/\[NAVIGATE:(.*?)\]/);
      if (navigateMatch) {
        replyText = replyText.replace(navigateMatch[0], "").trim();
        // Dispatch custom navigation event for smooth frontend routing
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('app-navigate', { detail: { path: navigateMatch[1] } }));
        }
      }

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

      const newAssistantMessage: Message = { role: "assistant", text: replyText, context };
      
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
        sessions: updatedSessions,
        messages: [...get().messages, newAssistantMessage]
      });
      saveSessionsToStorage(updatedSessions);

    } catch (error) {
      console.error(error);
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
    } finally {
      set({ isLoading: false });
    }
  },
}));
