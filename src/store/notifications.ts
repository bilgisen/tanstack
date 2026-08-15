import { create } from 'zustand';
import {  notificationsApi } from '../lib/notificationsApi';
import type {UserNotification} from '../lib/notificationsApi';

interface NotificationsState {
  items: Array<UserNotification>;
  unread: number;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markRead: (ids: Array<number>) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unread: 0,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await notificationsApi.list({ limit: 20 });
      set({ items: data.notifications, unread: data.unread, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  refreshUnread: async () => {
    try {
      const { unread } = await notificationsApi.unreadCount();
      // Aynı değerse set'i atla: zustand notify → re-render → effect döngüsü koruması
      if (get().unread !== unread) set({ unread });
    } catch { /* sessiz — anonim/oturum yoksa yok say */ }
  },

  markRead: async (ids) => {
    const unreadIds = ids.filter(id => !get().items.find(n => n.id === id)?.read_at);
    if (unreadIds.length === 0) return;
    try {
      await notificationsApi.markRead(unreadIds);
      set({
        items: get().items.map(n => (unreadIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)),
        unread: Math.max(get().unread - unreadIds.length, 0),
      });
    } catch { /* sessiz */ }
  },

  markAllRead: async () => {
    const unread = get().items.filter(n => !n.read_at).map(n => n.id);
    await get().markRead(unread);
  },

  reset: () => set({ items: [], unread: 0, loading: false, error: null }),
}));