import { create } from 'zustand';

export interface WatchlistItem {
  symbol: string;
  type: 'stock' | 'index';
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  isDefault: boolean;
}

interface WatchlistState {
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  addWatchlist: (name: string) => string;
  deleteWatchlist: (id: string) => void;
  setActiveWatchlistId: (id: string | null) => void;
  addItem: (watchlistId: string, symbol: string, type: 'stock' | 'index') => void;
  removeItem: (watchlistId: string, symbol: string) => void;
}

const getDefaultWatchlists = (): Watchlist[] => [
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

const loadWatchlistsFromStorage = (): Watchlist[] => {
  if (typeof window === 'undefined') return getDefaultWatchlists();
  try {
    const data = localStorage.getItem('hissepro_watchlists');
    return data ? JSON.parse(data) : getDefaultWatchlists();
  } catch (e) {
    console.error("Failed to load watchlists from localStorage:", e);
    return getDefaultWatchlists();
  }
};

const saveWatchlistsToStorage = (watchlists: Watchlist[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hissepro_watchlists', JSON.stringify(watchlists));
  } catch (e) {
    console.error("Failed to save watchlists to localStorage:", e);
  }
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: loadWatchlistsFromStorage(),
  activeWatchlistId: "default-list",

  setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),

  addWatchlist: (name) => {
    const cleanName = name.trim();
    if (!cleanName) return "";
    
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
    if (listToDelete?.isDefault) return; // Cannot delete default list

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
