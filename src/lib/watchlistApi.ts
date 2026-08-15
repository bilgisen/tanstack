import { getSessionToken } from '../store/chat';
import { API } from './apiConfig';

export interface ServerWatchlistItem {
  symbol: string;
  item_type: string;
  position: number;
}

export interface ServerWatchlist {
  id: number;
  name: string;
  is_default: boolean;
  position: number;
  items: Array<ServerWatchlistItem>;
}

export interface WatchlistLimits {
  maxLists: number;
  maxItems: number;
}

export interface WatchlistApiError extends Error {
  status?: number;
  limits?: WatchlistLimits | null;
}

const API_BASE = `${API.hono}/api/watchlists`;

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let payload: { error?: string; limits?: WatchlistLimits } | null = null;
    try { payload = await res.json(); } catch { /* yoksay */ }
    const err = new Error(payload?.error || `İstek başarısız (${res.status})`) as WatchlistApiError;
    err.status = res.status;
    err.limits = payload?.limits ?? null;
    throw err;
  }
  return res.json() as Promise<T>;
}

export interface FetchWatchlistsResponse {
  lists: Array<ServerWatchlist>;
  limits: WatchlistLimits;
}

export const watchlistApi = {
  fetchAll: () => call<FetchWatchlistsResponse>(''),
  create: (name: string) => call<{ ok: boolean; id: number | null; limits: WatchlistLimits }>('', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  remove: (id: number | string) => call<{ ok: boolean }>(`/${id}`, { method: 'DELETE' }),
  addItem: (id: number | string, symbol: string, itemType: 'stock' | 'index') =>
    call<{ ok: boolean; duplicate?: boolean; limits: WatchlistLimits }>(`/${id}/items`, {
      method: 'POST',
      body: JSON.stringify({ symbol, item_type: itemType }),
    }),
  removeItem: (id: number | string, symbol: string) =>
    call<{ ok: boolean }>(`/${id}/items/${encodeURIComponent(symbol)}`, { method: 'DELETE' }),
};