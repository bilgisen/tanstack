import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { 
  History, 
  PanelLeft,
  LogOut,
  User,
  Trash2,
  Star,
  SlidersHorizontal,
  MessageCirclePlus,
  Settings
} from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useChatStore } from "../../store/chat";
import { useWatchlistStore } from "../../store/watchlist";
import { useAuth } from "../../hooks/useAuth";
import { HTDashboard } from "../dashboard/HTDashboard";
import { Logo } from "./Logo";

export function LeftSidebar() {
  const { 
    isLeftSidebarExpanded, 
    toggleLeftSidebarExpanded, 
    theme,
    setTheme
  } = useUIStore();
  const { user, login: handleLogin, logout: handleLogout } = useAuth();
  const { sessions, activeSessionId, loadSession, deleteSession, clearChat } = useChatStore();
  const { watchlists, activeWatchlistId, setActiveWatchlistId } = useWatchlistStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside className={`
      flex flex-col border-r border-border bg-background text-foreground shrink-0 transition-all duration-300 h-full select-none relative
      fixed inset-y-0 left-0 z-50 lg:static
      ${isLeftSidebarExpanded 
        ? "w-[280px] translate-x-0 overflow-hidden" 
        : "w-0 -translate-x-full lg:translate-x-0 lg:w-16 lg:overflow-visible overflow-hidden"
      }
    `}>
      {isLeftSidebarExpanded ? (
        /* Full Expanded Sidebar Content */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Top Branding & Collapse Control */}
          <div className="flex items-center justify-between p-6 pb-4 shrink-0">
            <Link 
              to="/panel" 
              className="flex items-center gap-2 group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Logo size={20} variant="icon" />
              </div>
              <span className="font-display font-medium text-lg tracking-tight">Jetborsa</span>
            </Link>
            
            <button 
              onClick={toggleLeftSidebarExpanded}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              title="Paneli Kapat"
            >
              <PanelLeft size={16} />
            </button>
          </div>

          {/* Scrollable Navigation Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-6 custom-scrollbar min-h-0">
            
            {/* 1. New Conversation Button - Revolut Pill Style */}
            <button
              onClick={() => {
                clearChat();
                if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 px-4 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98] shrink-0"
            >
              <MessageCirclePlus size={16} />
              <span>Yeni Sohbet</span>
            </button>

            {/* 2. Chat History Section */}
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest select-none shrink-0">
                <History size={12} />
                <span>Geçmiş</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                {sessions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground/60 italic bg-muted/30 rounded-lg text-center">
                    Henüz sohbet yok.
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = activeSessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        className={`group flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                          isActive
                            ? "bg-muted text-foreground font-semibold border border-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          loadSession(session.id);
                          if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
                        }}
                      >
                        <span className="truncate">
                          {session.ticker} Analizi
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded-full transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Watchlists Section */}
            <div className="flex flex-col min-h-0 space-y-3 pt-4 border-t border-border/50 shrink-0">
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest select-none shrink-0">
                <div className="flex items-center gap-2">
                  <Star size={12} />
                  <span>Listeler</span>
                </div>
                <Link
                  to="/takip-listesi"
                  className="opacity-60 hover:opacity-100 transition-opacity p-1"
                >
                  <SlidersHorizontal size={12} />
                </Link>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {watchlists.map((list) => {
                  const isActive = activeWatchlistId === list.id;
                  return (
                    <Link
                      key={list.id}
                      to="/takip-listesi"
                      onClick={() => {
                        setActiveWatchlistId(list.id);
                        if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                        isActive
                          ? "bg-muted text-foreground font-semibold border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="truncate">{list.name}</span>
                      <span className="text-[10px] font-mono opacity-60 bg-muted px-1.5 py-0.5 rounded-full">
                        {list.items.length}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Fixed Footer Profile */}
          <div className="p-6 border-t border-border/50 shrink-0 flex flex-col gap-4 relative">
            {user && <HTDashboard />}
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity text-left"
                >
                  <img 
                    src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-full border border-border bg-muted shrink-0" 
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Ücretsiz Plan
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 cursor-pointer shrink-0"
                    title="Çıkış Yap"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin} 
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-sm cursor-pointer" 
              >
                Giriş Yap
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Slim Collapsed Sidebar Content */
        <div className="flex-1 flex flex-col h-full py-6 items-center justify-between overflow-y-auto overflow-x-visible scrollbar-none animate-in fade-in duration-300 select-none">
          <div className="flex flex-col items-center gap-6 w-full px-2">
            
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer" onClick={toggleLeftSidebarExpanded}>
              <Logo size={20} variant="icon" />
            </div>

            <button
              onClick={() => clearChat()}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full transition-all duration-200 cursor-pointer border border-border"
              title="Yeni Sohbet"
            >
              <MessageCirclePlus size={18} />
            </button>

            <button
              onClick={toggleLeftSidebarExpanded}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200 cursor-pointer"
              title="Geçmiş"
            >
              <History size={18} />
            </button>

            <Link
              to="/takip-listesi"
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200"
              title="Listeler"
            >
              <Star size={18} />
            </Link>

          </div>

          <div className="w-full px-2 flex flex-col items-center gap-4 shrink-0 relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all cursor-pointer"
              title="Ayarlar"
            >
              <Settings size={18} />
            </button>

            {user && <HTDashboard collapsed={true} />}
            {user ? (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-10 h-10 flex items-center justify-center relative rounded-full hover:brightness-90 transition-all duration-200 cursor-pointer overflow-hidden border border-border"
              >
                <img 
                  src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-all duration-200 cursor-pointer"
              >
                <User size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings Popover */}
      {isSettingsOpen && (
        <div className={`
          absolute z-50 bg-background border border-border rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-sm
          ${isLeftSidebarExpanded 
            ? "bottom-20 left-6 right-6" 
            : "bottom-24 left-16 w-56"
          }
        `}>
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Hesap</div>
            
            <div className="p-2 bg-muted/50 rounded-xl">
              <div className="px-1 pb-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Görünüm</div>
              <div className="grid grid-cols-3 gap-1">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize cursor-pointer ${
                      theme === t 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-background"
                    }`}
                  >
                    {t === 'light' ? 'Açık' : t === 'dark' ? 'Koyu' : 'Sis'}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors text-left cursor-pointer"
            >
              <Settings size={14} className="text-muted-foreground" />
              <span>Ayarlar</span>
            </button>

            <div className="h-px bg-border my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left cursor-pointer font-semibold"
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
