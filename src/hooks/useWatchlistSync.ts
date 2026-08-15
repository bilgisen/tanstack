import { useEffect, useRef } from 'react';
import { useWatchlistStore } from '../store/watchlist';
import { watchlistApi } from '../lib/watchlistApi';
import { useAuth } from './useAuth';

/**
 * N1: Takip listesi senkronu.
 * - Login (user var): localStorage'daki öğeler sunucu default listesine merge edilir,
 *   ardından sunucu durumu yüklenir (serverMode).
 * - Logout (user yok): sunucu görünümü localStorage'a kaydedilir, local moda dönülür.
 */
export function useWatchlistSync() {
  const { user, loading } = useAuth();
  const serverMode = useWatchlistStore(s => s.serverMode);
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;

    const userId = user?.id ?? null;
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;

    // Hydration: SSR/client ilk render'ı boş başladığı için localStorage'ı
    // mount sonrası yükle (sunucu moduna geçmeden önce).
    if (!userId) {
      useWatchlistStore.getState().hydrateFromLocal();
    }

    if (userId) {
      // Login: merge + pull
      (async () => {
        const store = useWatchlistStore.getState();
        try {
          const data = await watchlistApi.fetchAll();
          const serverSymbols = new Set(
            data.lists.flatMap(l => (l.items || []).map(it => it.symbol))
          );
          const localSymbols = store.watchlists.flatMap(w => w.items);
          const defaultList = data.lists.find(l => l.is_default) ?? data.lists[0];
          if (defaultList) {
            for (const it of localSymbols) {
              if (!serverSymbols.has(it.symbol.toUpperCase())) {
                try {
                  await watchlistApi.addItem(defaultList.id, it.symbol, it.type);
                } catch { /* limit vb. — lastError dolu, devam */ }
              }
            }
          }
          useWatchlistStore.getState().syncFromServer(data.lists, data.limits);
        } catch (e) {
          useWatchlistStore.getState().refreshFromServer().catch(() => {
            useWatchlistStore.setState({ lastError: (e as Error).message });
          });
        }
      })();
    } else {
      useWatchlistStore.getState().exitServerMode();
    }
  }, [user?.id, loading]);

  return { serverMode };
}