import { getSessionToken } from '../store/chat';
import { API } from './apiConfig';

export interface UserNotification {
  id: number;
  type: 'kap_takip' | 'sistem';
  title: string;
  body: string | null;
  disclosure_index: string | null;
  ticker: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Array<UserNotification>;
  unread: number;
  limit: number;
  offset: number;
}

const API_BASE = `${API.hono}/api/user/notifications`;

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let payload: { error?: string } | null = null;
    try { payload = await res.json(); } catch { /* yoksay */ }
    throw new Error(payload?.error || `İstek başarısız (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const notificationsApi = {
  list: (opts: { limit?: number; offset?: number; unreadOnly?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.offset) params.set('offset', String(opts.offset));
    if (opts.unreadOnly) params.set('unreadOnly', '1');
    return call<NotificationsResponse>(`?${params.toString()}`);
  },
  unreadCount: () => call<{ unread: number }>('/unread-count'),
  markRead: (ids: Array<number>) => call<{ ok: boolean; updated: number }>('/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  }),
};