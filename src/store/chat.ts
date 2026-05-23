import { create } from 'zustand';

export type Message = {
  role: "user" | "assistant";
  text: string;
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

    // Add user message
    set((state) => ({
      messages: [...state.messages, { role: "user", text: trimmedText }],
      isLoading: true,
    }));

    try {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787";
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
      }

      set((state) => ({
        messages: [...state.messages, { role: "assistant", text: replyText }],
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", text: "Özür dilerim, şu an yanıt üretemiyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin." },
        ],
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
