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
      flex flex-col border-r border-border bg-card text-card-foreground shrink-0 transition-all duration-300 h-full select-none relative
      fixed inset-y-0 left-0 z-50 lg:static
      ${isLeftSidebarExpanded 
        ? "w-[260px] translate-x-0 overflow-hidden" 
        : "w-0 -translate-x-full lg:translate-x-0 lg:w-14 lg:overflow-visible overflow-hidden"
      }
    `}>
      {isLeftSidebarExpanded ? (
        /* Full Expanded Sidebar Content */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Top Branding & Collapse Control */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-border/40 shrink-0">
            <Link 
              to="/panel" 
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 text-primary hover:bg-primary/20 hover:border-primary/25 transition-all shadow-3xs hover:scale-105 active:scale-[0.98] shrink-0"
              title="HissePro Paneli"
            >
              <Logo size={20} className="shrink-0" />
            </Link>
            
            <button 
              onClick={toggleLeftSidebarExpanded}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
              title="Paneli Kapat"
            >
              <PanelLeft size={14} />
            </button>
          </div>

          {/* Scrollable Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-5 custom-scrollbar min-h-0">
            
            {/* 1. New Conversation Button (Fined tuned to be thinner and cleaner) */}
            <button
              onClick={() => {
                clearChat();
                if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
              }}
              className="w-full flex items-center justify-center gap-2 bg-muted/40 hover:bg-muted/80 text-foreground border border-border/80 hover:border-border rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-3xs active:scale-[0.98] shrink-0"
            >
              <MessageCirclePlus size={14} className="text-[#1D9BF0]" />
              <span>Yeni Sohbet</span>
            </button>

            {/* 2. Chat History (Sohbet Geçmişi) Section */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              {/* Section Header */}
              <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none shrink-0">
                <History size={11} className="text-muted-foreground" />
                <span>Sohbet Geçmişi</span>
              </div>

              {/* Chat Sessions List (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
                {sessions.length === 0 ? (
                  <div className="px-2 py-3 text-[11px] text-muted-foreground/60 italic bg-muted/10 rounded-lg text-center">
                    Geçmiş sohbet bulunmuyor.
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = activeSessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                        }`}
                        onClick={() => {
                          loadSession(session.id);
                          if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
                        }}
                      >
                        <span className="truncate font-mono tracking-tight text-[11px]">
                          {session.ticker}-{session.code}-{session.date}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive rounded-md transition-all cursor-pointer shrink-0 ml-1"
                          title="Sohbeti Sil"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Watchlists (Takip Listelerim) Section */}
            <div className="flex flex-col min-h-0 space-y-2 pt-2 border-t border-border/20 shrink-0">
              {/* Section Header */}
              <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none shrink-0">
                <div className="flex items-center gap-2">
                  <Star size={11} className="text-muted-foreground" />
                  <span>Takip Listelerim</span>
                </div>
                <Link
                  to="/panel/takip-listesi"
                  className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
                  title="Listeleri Yönet"
                >
                  <SlidersHorizontal size={10} className="cursor-pointer" />
                </Link>
              </div>

              {/* Watchlists List */}
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {watchlists.map((list) => {
                  const isActive = activeWatchlistId === list.id;
                  return (
                    <Link
                      key={list.id}
                      to="/panel/takip-listesi"
                      onClick={() => {
                        setActiveWatchlistId(list.id);
                        if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                      }`}
                    >
                      <span className="truncate">{list.name}</span>
                      <span className="text-[10px] font-mono opacity-80 px-1 bg-muted/40 rounded">
                        {list.items.length}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Fixed Footer Profile */}
          <div className="p-4 border-t border-border/40 shrink-0 flex flex-col gap-4 relative">
            {user && <HTDashboard />}
            {user ? (
              <div className="flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-border bg-card shadow-2xs transition-all duration-300 shrink-0" 
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all cursor-pointer shrink-0 ${
                      isSettingsOpen ? "bg-muted text-foreground" : ""
                    }`}
                    title="Ayarlar"
                  >
                    <Settings size={13} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200 cursor-pointer shrink-0"
                    title="Çıkış Yap"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin} 
                className="w-full flex items-center justify-center px-3 py-2 text-[11px] font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer" 
                title="Giriş Yap"
              >
                <User size={12} className="mr-1" />
                Giriş Yap
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Slim, Ultra-Clean Collapsed Sidebar Content (Thinner, finer padding & sleek gap) */
        <div className="flex-1 flex flex-col h-full py-3 items-center justify-between overflow-y-auto overflow-x-visible scrollbar-none animate-in fade-in duration-300 select-none">
          <div className="flex flex-col items-center gap-4 w-full px-2">
            
            {/* Logo in Collapsed State with Gemini-like Hover Expand Trigger */}
            <div className="relative group w-9 h-9 flex items-center justify-center mb-1">
              <div className="transition-all duration-200 group-hover:scale-0 group-hover:opacity-0 flex items-center justify-center">
                <Logo size={16} className="text-foreground" />
              </div>
              <button
                onClick={toggleLeftSidebarExpanded}
                className="absolute inset-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 cursor-pointer"
                title="Ana menüyü genişlet"
              >
                <PanelLeft size={14} />
              </button>
            </div>

            {/* 1. Plus (Yeni Sohbet) Button */}
            <button
              onClick={() => clearChat()}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 rounded-full transition-all duration-200 cursor-pointer border border-border/30 animate-pulse"
              title="Yeni Sohbet"
            >
              <MessageCirclePlus size={15} className="text-[#1D9BF0]" />
            </button>

            {/* 2. Sohbet Geçmişi Toggle (Expands the sidebar to show list) */}
            <button
              onClick={toggleLeftSidebarExpanded}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-all duration-200 cursor-pointer"
              title="Sohbet Geçmişi"
            >
              <History size={14} />
            </button>

            {/* 3. Watchlist (Star) Icon to quickly navigate to Watchlist page */}
            <Link
              to="/panel/takip-listesi"
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-all duration-200"
              title="Takip Listeleri"
            >
              <Star size={14} />
            </Link>

          </div>

          {/* Bottom profile/logout area for collapsed state */}
          <div className="w-full px-2 flex flex-col items-center gap-2 shrink-0 relative">
            {/* Settings Gear Button placed above the Avatar when Collapsed */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/45 rounded-lg transition-all cursor-pointer ${
                isSettingsOpen ? "bg-muted text-foreground" : ""
              }`}
              title="Ayarlar"
            >
              <Settings size={14} />
            </button>

            {user && <HTDashboard collapsed={true} />}
            {user ? (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="group w-9 h-9 flex items-center justify-center relative rounded-lg hover:bg-muted/40 transition-all duration-200 cursor-pointer"
                title="Hesap ve Ayarlar"
              >
                <img 
                  src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  alt="Avatar" 
                  className="w-6.5 h-6.5 rounded-full border border-border bg-card shadow-2xs group-hover:border-foreground transition-all duration-300" 
                />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/40 rounded-lg transition-all duration-200 cursor-pointer"
                title="Giriş Yap"
              >
                <User size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Unified Settings Popover placed outside of inner scrolling content to guarantee rendering without clipping */}
      {isSettingsOpen && (
        <div className={`
          absolute z-50 bg-card border border-border/80 rounded-2xl p-2.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs text-left
          ${isLeftSidebarExpanded 
            ? "bottom-18 left-4 right-4" 
            : "bottom-24 left-14 w-48"
          }
        `}>
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ayarlar</div>
            
            {/* Theme Selector Popover */}
            <div className="p-1.5 bg-muted/40 rounded-xl mb-1">
              <div className="px-1.5 pb-1 text-[10px] text-muted-foreground/80 font-medium">Tema Seçimi</div>
              <div className="grid grid-cols-3 gap-1">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all capitalize cursor-pointer ${
                      theme === t 
                        ? "bg-[#1D9BF0] text-white shadow-xs" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {t === 'light' ? 'Açık' : t === 'dark' ? 'Koyu' : 'Sistem'}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => alert("Etkinlik geçmişi yakında eklenecek!")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground/90 transition-colors text-left cursor-pointer"
            >
              <History size={13} className="text-muted-foreground" />
              <span>Etkinlik Geçmişi</span>
            </button>

            <div className="h-px bg-border/40 my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left cursor-pointer font-semibold"
            >
              <LogOut size={13} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
