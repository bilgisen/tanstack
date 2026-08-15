import { getSessionToken } from '../store/chat';
import { API } from './apiConfig';

const API_BASE = `${API.hono}/api/user/push`;

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

export const pushApi = {
  publicKey: () => call<{ publicKey: string }>('/public-key'),
  subscribe: (sub: PushSubscription) =>
    call<{ ok: boolean }>('/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: sub.toJSON().keys,
      }),
    }),
  unsubscribe: (endpoint: string) =>
    call<{ ok: boolean }>('/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    }),
  status: () => call<{ subscriptions: Array<string> }>('/status'),
};

/** base64url → Uint8Array (applicationServerKey için) */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Url = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Url);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}