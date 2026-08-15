import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotificationsStore } from "../../store/notifications";
import type { UserNotification } from "../../lib/notificationsApi";

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "şimdi";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa`;
  return `${Math.floor(h / 24)} g`;
}

function NotificationRow({ n }: { n: UserNotification }) {
  const { markRead } = useNotificationsStore();
  const inner = (
    <>
      <span className={`block h-2 w-2 rounded-full mt-1 shrink-0 ${n.read_at ? "bg-transparent" : "bg-primary animate-pulse"}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-semibold text-foreground truncate">{n.title}</span>
        {n.body && <span className="block text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</span>}
        <span className="block text-[10px] text-muted-foreground/70 mt-1">
          {n.ticker && <span className="font-mono font-bold text-primary/80">{n.ticker} · </span>}
          {timeAgo(n.created_at)}
        </span>
      </span>
    </>
  );
  const onClick = () => { if (!n.read_at) void markRead([n.id]); };
  return n.link ? (
    <Link
      to={n.link as never}
      onClick={onClick}
      className={`flex items-start gap-2.5 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${n.read_at ? "" : "bg-primary/[0.04]"}`}
    >
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={`w-full flex items-start gap-2.5 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer text-left ${n.read_at ? "" : "bg-primary/[0.04]"}`}>
      {inner}
    </button>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const { items, unread, loading, fetch: fetchAll, refreshUnread, markAllRead } = useNotificationsStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Oturum değişince sıfırla
  const lastUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const uid = user?.id ?? null;
    if (lastUserId.current !== uid) {
      lastUserId.current = uid;
      useNotificationsStore.getState().reset();
      if (uid) {
        void fetchAll();
        void refreshUnread();
      }
    }
  }, [user?.id, fetchAll, refreshUnread]);

  // Poll (oturum açıkken) — user?.id bazlı: user objesi referansı değişse bile
  // interval kurulumu tetiklenmesin (istek patlaması koruması)
  useEffect(() => {
    if (!user?.id) return;
    void refreshUnread();
    const t = setInterval(() => void refreshUnread(), POLL_MS);
    return () => clearInterval(t);
  }, [user?.id, refreshUnread]);

  // Dış tıklama ile kapat
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Dropdown açılınca listeyi tazele
  useEffect(() => {
    if (open && user?.id) void fetchAll();
  }, [open, user?.id, fetchAll]);

  const unreadItems = items.filter(n => !n.read_at);
  const unreadIds = unreadItems.map(n => n.id);

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => { if (user) { setOpen(o => !o); } else { window.location.href = "/profil"; } }}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
        aria-label="Bildirimler"
        title={user ? "Bildirimler" : "Bildirimler için giriş yapın"}
      >
        <Bell size={18} className="text-muted-foreground" />
        {mounted && user && unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && user && (
        <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-100 z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
            <span className="text-xs font-bold text-foreground">Bildirimler</span>
            {unreadIds.length > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <CheckCheck size={13} /> Tümünü oku
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-border/40">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">Yükleniyor...</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                Henüz bildiriminiz yok. Takip listenizdeki hisselere dair önemli KAP bildirimleri burada görünür.
              </p>
            ) : (
              items.map(n => <NotificationRow key={n.id} n={n} />)
            )}
          </div>

          <div className="border-t border-border/60">
            <Link
              to="/bildirimlerim"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-xs font-bold text-primary hover:bg-muted/50 transition-colors cursor-pointer"
            >
              Tüm Bildirimler
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}