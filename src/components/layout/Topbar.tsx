import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Settings, Sun, Moon, Monitor, User } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import type { Theme } from "../../store/ui";

export function Topbar() {
  const { theme, setTheme } = useUIStore();
  const { user, login: handleLogin } = useAuth();
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

  return (
    <header className="w-full h-14 border-b border-border/40 bg-card/15 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left: Branding & Icon */}
      <div className="flex items-center gap-3">
        <Link to="/panel" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
          <Logo size={18} className="text-foreground shrink-0" />
          <span className="font-semibold text-base tracking-tight font-sans text-foreground">
            Hisse<span className="text-muted-foreground/60 font-medium">Pro</span>
          </span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3.5">
        
        {/* Yükselt Button */}
        <Link 
          to="/panel/profil" 
          className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/95 text-white text-[11px] sm:text-xs font-semibold tracking-tight transition-all duration-200 shadow-sm shrink-0 text-center"
        >
          Yükselt
        </Link>

        {/* Settings & Theme Dropdown Trigger */}
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all cursor-pointer flex items-center justify-center border border-transparent active:scale-95 shrink-0"
            title="Ayarlar & Görünüm"
          >
            <Settings size={18} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-45' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
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
            </div>
          )}
        </div>

        {/* User Profile Avatar / Login Icon */}
        {user ? (
          <Link 
            to="/panel/profil"
            className="w-8 h-8 rounded-full overflow-hidden border border-border/60 hover:border-primary/50 transition-all shrink-0 cursor-pointer shadow-3xs flex items-center justify-center bg-primary/15 text-primary font-semibold text-xs"
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
        ) : (
          <button
            onClick={handleLogin}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition-all cursor-pointer border border-border/40 shrink-0"
            title="Giriş Yap"
          >
            <User size={14} />
          </button>
        )}

      </div>

    </header>
  );
}
