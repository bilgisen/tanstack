import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Bell, BellRing, CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNotificationsStore } from '../store/notifications'
import { usePushNotifications } from '../hooks/usePushNotifications'
import type { UserNotification } from '../lib/notificationsApi'

export const Route = createFileRoute('/bildirimlerim')({
  component: MyNotificationsPage,
})

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk önce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function NotificationCard({ n }: { n: UserNotification }) {
  const { markRead } = useNotificationsStore();
  const unread = !n.read_at;

  const onClick = () => { if (unread) void markRead([n.id]); };

  const inner = (
    <div className="flex items-start gap-3">
      <span className={`block h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${unread ? 'bg-primary animate-pulse' : 'bg-muted-foreground/20'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {n.type === 'sistem' ? (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Sistem</span>
          ) : (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">KAP</span>
          )}
          {n.ticker && (
            <span className="text-[10px] font-bold font-mono text-primary">{n.ticker}</span>
          )}
        </div>
        <h3 className={`text-sm mt-1 ${unread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</h3>
        {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
        <p className="text-[11px] text-muted-foreground/70 mt-2">{timeAgo(n.created_at)}</p>
      </div>
      {unread && <CheckCheck size={14} className="text-muted-foreground/40 mt-1 shrink-0" />}
    </div>
  );

  return n.link ? (
    <Link to={n.link as never} onClick={onClick} className="block p-4 hover:bg-muted/40 transition-colors cursor-pointer">
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className="w-full text-left p-4 hover:bg-muted/40 transition-colors cursor-pointer">
      {inner}
    </button>
  );
}

function MyNotificationsPage() {
  const { user } = useAuth();
  const { items, unread, loading, error, fetch: fetchAll, refreshUnread, markAllRead } = useNotificationsStore();
  const { state: pushState, enable: enablePush, disable: disablePush } = usePushNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (user?.id) { void fetchAll(); void refreshUnread(); }
  }, [user?.id, fetchAll, refreshUnread]);

  const visible = filter === 'unread' ? items.filter(n => !n.read_at) : items;

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushState === 'active') await disablePush();
      else await enablePush();
      void fetchAll();
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="text-primary" size={24} /> Bildirimlerim
          </h1>
          <p className="text-sm text-muted-foreground">Takip listenizdeki hisselere dair önemli KAP bildirimleri ve sistem duyuruları.</p>
        </div>
        {items.some(n => !n.read_at) && (
          <button
            onClick={() => void markAllRead()}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer"
          >
            <CheckCheck size={14} /> Tümünü okundu işaretle
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-border/80 pb-px shrink-0">
        {([['all', `Tümü (${items.length})`], ['unread', `Okunmamış (${unread})`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
              filter === key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* N3: Tarayıcı Push Tercihi */}
      {user && pushState !== 'unsupported' && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shrink-0">
          <div className="flex items-start gap-3">
            <BellRing className={`mt-0.5 shrink-0 ${pushState === 'active' ? 'text-primary' : 'text-muted-foreground/40'}`} size={18} />
            <div>
              <div className="text-sm font-semibold text-foreground">Tarayıcı Bildirimleri</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {pushState === 'active'
                  ? 'Açık — önemli KAP bildirimleri tarayıcı kapalıyken bile gösterilir.'
                  : pushState === 'denied'
                    ? 'Tarayıcınız bildirim iznini engelledi — tarayıcı ayarlarından izin verebilirsiniz.'
                    : 'Kapalı — açtığınızda önemli KAP bildirimleri tarayıcınıza gelir.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => void togglePush()}
            disabled={pushBusy || pushState === 'denied' || pushState === 'loading'}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              pushState === 'active'
                ? 'bg-muted text-foreground hover:bg-muted/70'
                : 'bg-primary text-primary-foreground hover:bg-primary/95'
            }`}
          >
            {pushBusy ? 'İşleniyor...' : pushState === 'active' ? 'Kapat' : 'Aç'}
          </button>
        </div>
      )}

      {!user ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 max-w-sm">
            <Bell className="mx-auto text-muted-foreground/40" size={40} />
            <p className="text-sm text-muted-foreground">
              Bildirimleri görmek için giriş yapın. Takip listenizdeki hisselere dair KAP bildirimleri otomatik burada toplanır.
            </p>
            <Link to="/profil" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold">
              Giriş Yap
            </Link>
          </div>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2 max-w-sm">
            <Bell className="mx-auto text-muted-foreground/30" size={40} />
            <p className="text-xs text-muted-foreground">
              {filter === 'unread' ? 'Okunmamış bildiriminiz yok.' : 'Henüz bildiriminiz yok. Takip listenize hisse ekleyin, önemli KAP bildirimleri burada görünsün.'}
            </p>
            {filter === 'all' && (
              <Link to="/takip-listesi" className="inline-block text-xs font-bold text-primary hover:underline">
                Takip Listenize Git
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/40">
            {visible.map(n => <NotificationCard key={n.id} n={n} />)}
          </div>
        </div>
      )}
    </div>
  )
}