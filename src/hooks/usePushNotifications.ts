import { useCallback, useEffect, useState } from 'react';
import { pushApi, urlBase64ToUint8Array } from '../lib/pushApi';
import { useAuth } from './useAuth';

export type PushState = 'unsupported' | 'denied' | 'inactive' | 'active' | 'loading';

/**
 * N3: Tarayıcı push aboneliği yönetimi.
 * - Mount'ta sw.js kaydedilir + mevcut abonelik/izin durumu okunur
 * - enable(): izin iste → pushManager.subscribe (VAPID) → sunucuya kaydet
 * - disable(): aboneliği iptal et + sunucudan sil
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>('loading');
  const [swReady, setSwReady] = useState(false);

  const readStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? 'active' : 'inactive');
    } catch {
      setState('inactive');
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setState('inactive'); return; }
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js')
      .then(() => setSwReady(true))
      .catch(() => setSwReady(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !swReady) return;
    void readStatus();
  }, [user?.id, swReady, readStatus]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (state === 'unsupported' || state === 'denied') return false;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState('denied'); return false; }

      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await pushApi.publicKey();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await pushApi.subscribe(sub);
      setState('active');
      return true;
    } catch (e) {
      console.error('[Push] abonelik hatası:', e);
      return false;
    }
  }, [state]);

  const disable = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setState('inactive');
      return true;
    } catch (e) {
      console.error('[Push] iptal hatası:', e);
      return false;
    }
  }, []);

  return { state, enable, disable };
}