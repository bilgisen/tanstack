import { create } from 'zustand';
import {   watchlistApi } from '../lib/watchlistApi';
import type {ServerWatchlist, WatchlistLimits} from '../lib/watchlistApi';

export interface WatchlistItem {
  symbol: string;
  type: 'stock' | 'index';
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: Array<WatchlistItem>;
  isDefault: boolean;
}

interface WatchlistState {
  watchlists: Array<Watchlist>;
  activeWatchlistId: string | null;
  // N1: sunucu senkronu
  serverMode: boolean;
  serverLimits: WatchlistLimits | null;
  lastError: string | null;
  clearError: () => void;
  syncFromServer: (lists: Array<ServerWatchlist>, limits: WatchlistLimits) => void;
  refreshFromServer: () => Promise<void>;
  exitServerMode: () => void;
  // CRUD
  addWatchlist: (name: string) => string;
  deleteWatchlist: (id: string) => void;
  setActiveWatchlistId: (id: string | null) => void;
  addItem: (watchlistId: string, symbol: string, type: 'stock' | 'index') => void;
  removeItem: (watchlistId: string, symbol: string) => void;
}

const STORAGE_KEY = 'hissepro_watchlists';

const getDefaultWatchlists = (): Array<Watchlist> => [
  {
    id: "default-list",
    name: "Takip Listem",
    isDefault: true,
    items: [
      { symbol: "XU100", type: "index", addedAt: new Date().toISOString() },
      { symbol: "THYAO", type: "stock", addedAt: new Date().toISOString() },
      { symbol: "TUPRS", type: "stock", addedAt: new Date().toISOString() },
      { symbol: "EREGL", type: "stock", addedAt: new Date().toISOString() },
    ]
  }
];

const loadWatchlistsFromStorage = (): Array<Watchlist> => {
  if (typeof window === 'undefined') return getDefaultWatchlists();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultWatchlists();
  } catch (e) {
    console.error("Failed to load watchlists from localStorage:", e);
    return getDefaultWatchlists();
  }
};

const saveWatchlistsToStorage = (watchlists: Array<Watchlist>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
  } catch (e) {
    console.error("Failed to save watchlists to localStorage:", e);
  }
};

/** Sunucu yanıtını local Watchlist modeline çevirir (id sayısal → string). */
const toLocalWatchlists = (lists: Array<ServerWatchlist>): Array<Watchlist> =>
  lists.map(l => ({
    id: String(l.id),
    name: l.name,
    isDefault: !!l.is_default,
    items: (l.items || []).map(it => ({
      symbol: it.symbol,
      type: it.item_type === 'index' ? 'index' : 'stock',
      addedAt: new Date().toISOString(),
    })),
  }));

const toItemType = (t: 'stock' | 'index'): 'stock' | 'index' => (t === 'index' ? 'index' : 'stock');

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: loadWatchlistsFromStorage(),
  activeWatchlistId: "default-list",
  serverMode: false,
  serverLimits: null,
  lastError: null,

  clearError: () => set({ lastError: null }),

  syncFromServer: (lists, limits) => {
    const local = toLocalWatchlists(lists);
    set({
      watchlists: local,
      activeWatchlistId: local.find(w => w.isDefault)?.id ?? local[0]?.id ?? null,
      serverMode: true,
      serverLimits: limits,
      lastError: null,
    });
  },

  refreshFromServer: async () => {
    try {
      const data = await watchlistApi.fetchAll();
      get().syncFromServer(data.lists, data.limits);
    } catch (e) {
      set({ lastError: (e as Error).message });
    }
  },

  exitServerMode: () => {
    const { watchlists } = get();
    saveWatchlistsToStorage(watchlists);
    set({ serverMode: false, serverLimits: null, activeWatchlistId: watchlists.find(w => w.isDefault)?.id ?? watchlists[0]?.id ?? "default-list" });
  },

  setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),

  addWatchlist: (name) => {
    const cleanName = name.trim();
    if (!cleanName) return "";

    if (get().serverMode) {
      void watchlistApi.create(cleanName)
        .then(() => get().refreshFromServer())
        .catch((e: Error) => set({ lastError: e.message }));
      return "pending";
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const newWatchlist: Watchlist = {
      id,
      name: cleanName,
      isDefault: false,
      items: []
    };

    const updated = [...get().watchlists, newWatchlist];
    set({ watchlists: updated, activeWatchlistId: id });
    saveWatchlistsToStorage(updated);
    return id;
  },

  deleteWatchlist: (id) => {
    const listToDelete = get().watchlists.find(w => w.id === id);
    if (listToDelete?.isDefault) return;

    if (get().serverMode) {
      void watchlistApi.remove(id)
        .then(() => get().refreshFromServer())
        .catch((e: Error) => set({ lastError: e.message }));
      return;
    }

    const updated = get().watchlists.filter(w => w.id !== id);
    let nextActive = get().activeWatchlistId;
    if (get().activeWatchlistId === id) {
      nextActive = get().watchlists.find(w => w.isDefault)?.id || "default-list";
    }

    set({ watchlists: updated, activeWatchlistId: nextActive });
    saveWatchlistsToStorage(updated);
  },

  addItem: (watchlistId, symbol, type) => {
    const upperSymbol = symbol.trim().toUpperCase();
    if (!upperSymbol) return;

    if (get().serverMode) {
      void watchlistApi.addItem(watchlistId, upperSymbol, toItemType(type))
        .then(() => get().refreshFromServer())
        .catch((e: Error) => set({ lastError: e.message }));
      return;
    }

    const updated = get().watchlists.map(w => {
      if (w.id === watchlistId) {
        const alreadyExists = w.items.some(item => item.symbol === upperSymbol);
        if (alreadyExists) return w;
        return {
          ...w,
          items: [...w.items, { symbol: upperSymbol, type, addedAt: new Date().toISOString() }]
        };
      }
      return w;
    });

    set({ watchlists: updated });
    saveWatchlistsToStorage(updated);
  },

  removeItem: (watchlistId, symbol) => {
    const upperSymbol = symbol.trim().toUpperCase();

    if (get().serverMode) {
      void watchlistApi.removeItem(watchlistId, upperSymbol)
        .then(() => get().refreshFromServer())
        .catch((e: Error) => set({ lastError: e.message }));
      return;
    }

    const updated = get().watchlists.map(w => {
      if (w.id === watchlistId) {
        return {
          ...w,
          items: w.items.filter(item => item.symbol !== upperSymbol)
        };
      }
      return w;
    });

    set({ watchlists: updated });
    saveWatchlistsToStorage(updated);
  }
}));