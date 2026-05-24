import { create } from 'zustand';

export type Message = {
  role: "user" | "assistant";
  text: string;
  context?: string;
};

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string, context: string) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  clearChat: () => set({ messages: [] }),
  sendMessage: async (text: string, context: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || get().isLoading) return;

    // Add user message with current context
    set((state) => ({
      messages: [...state.messages, { role: "user", text: trimmedText, context }],
      isLoading: true,
    }));

    try {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedText,
          context: context,
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

      set((state) => ({
        messages: [...state.messages, { role: "assistant", text: replyText, context }],
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", text: "Özür dilerim, şu an yanıt üretemiyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.", context },
        ],
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
