import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Settings, Sun, Moon, Monitor, User, MoreVertical, Star, ChartNoAxesCombined, Factory, Building2, LogOut } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import type { Theme } from "../../store/ui";

export function Topbar() {
  const { theme, setTheme } = useUIStore();
  const { user, login: handleLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="w-full h-14 border-b border-border/40 bg-card/15 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left: Branding & Navigation */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
          <Logo size={14} className="text-foreground shrink-0" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link 
            to="/endeksler" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Endeksler"
          >
            <ChartNoAxesCombined size={16} className="shrink-0" />
            <span>Endeksler</span>
          </Link>
          <Link 
            to="/sektorler" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Sektörler"
          >
            <Factory size={16} className="shrink-0" />
            <span>Sektörler</span>
          </Link>
          <Link 
            to="/sirketler" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Şirketler"
          >
            <Building2 size={16} className="shrink-0" />
            <span>Şirketler</span>
          </Link>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* Yükselt Button - only for logged in users */}
        {user && (
          <Link 
            to="/panel/profil" 
            className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/95 text-white text-[11px] sm:text-xs font-semibold tracking-tight transition-all duration-200 shadow-sm shrink-0 text-center"
          >
            Yükselt
          </Link>
        )}

        {/* Star - Takip Listesi (logged-in only) */}
        {user && (
          <Link 
            to="/takip-listesi"
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-muted/50 transition-all shrink-0"
            title="Takip Listem"
          >
            <Star size={16} />
          </Link>
        )}

        {/* User Avatar + Kebab Menu (logged-in) */}
        {user && (
          <div className="relative" ref={settingsRef}>
            <div className="flex items-center gap-1">
              {/* Avatar */}
              <Link 
                to="/panel/profil"
                className="w-8 h-8 rounded-full border border-foreground bg-background text-foreground flex items-center justify-center font-semibold text-xs shrink-0 cursor-pointer hover:opacity-80 transition-all"
                title={user.email || "Profil"}
              >
                {(() => {
                  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
                  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
                  const initials = parts.length >= 2
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : (parts[0]?.[0] || "U").toUpperCase();
                  return initials;
                })()}
              </Link>
              {/* Kebab */}
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Menü"
              >
                <MoreVertical size={16} />
              </button>
            </div>
            
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                {/* Profil */}
                <button 
                  onClick={() => { setDropdownOpen(false); navigate({ to: '/panel/profil' }); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <User size={14} className="shrink-0" />
                  <span>Profil</span>
                </button>

                <div className="border-t border-border/30 my-1" />

                {/* Tema */}
                <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider px-3 pb-1.5 pt-1">
                  Tema
                </div>
                
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'light' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Sun size={14} className="shrink-0" />
                    <span>Açık</span>
                  </div>
                  {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>
                
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'dark' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="shrink-0" />
                    <span>Koyu</span>
                  </div>
                  {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>
                
                <button 
                  onClick={() => handleThemeChange('system')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'system' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="shrink-0" />
                    <span>Sistem</span>
                  </div>
                  {theme === 'system' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>

                <div className="border-t border-border/30 my-1" />

                {/* Çıkış Yap */}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Kebab Menu - for anonymous users */}
        {!user && (
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Menü"
            >
              <MoreVertical size={18} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider px-3 pb-2 pt-1.5 border-b border-border/30 mb-1">
                  Görünüm Teması
                </div>
                
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'light' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Sun size={14} className="shrink-0" />
                    <span>Açık Tema</span>
                  </div>
                  {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>
                
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'dark' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="shrink-0" />
                    <span>Koyu Tema</span>
                  </div>
                  {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>
                
                <button 
                  onClick={() => handleThemeChange('system')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${theme === 'system' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="shrink-0" />
                    <span>Sistem Teması</span>
                  </div>
                  {theme === 'system' && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                </button>

                <div className="border-t border-border/30 my-1" />

                <button
                  onClick={handleLogin}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-primary hover:bg-primary/10"
                >
                  <User size={14} className="shrink-0" />
                  <span>Giriş Yap</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </header>
  );
}
