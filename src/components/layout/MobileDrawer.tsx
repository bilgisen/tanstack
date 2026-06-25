import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Sparkles,
  Star,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { navigationItems } from "@/lib/navigationItems";
import { useUIStore } from "../../store/ui";
import type { Theme } from "../../store/ui";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onLogout,
  onLogin,
  isLoggedIn,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Açık" },
    { value: "dark", icon: Moon, label: "Koyu" },
    { value: "system", icon: Monitor, label: "Sistem" },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 bottom-0 w-72 bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <span className="text-sm font-bold text-foreground tracking-tight">Menü</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col">
          {/* Navigation Items */}
          <div className="flex flex-col gap-0.5 mb-3">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </Link>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-white/10 my-1" />

          {/* Takip Listesi (logged in only) */}
          {isLoggedIn && (
            <>
              <Link
                to="/takip-listesi"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group mb-1"
              >
                <div className="flex items-center gap-3">
                  <Star size={20} className="shrink-0 text-amber-400" />
                  <span>Takip Listem</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </Link>
              <div className="border-t border-white/10 my-1" />
            </>
          )}

          {/* Auth: Google ile bağlan / Çıkış yap */}
          {isLoggedIn ? (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={20} className="shrink-0" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onLogin();
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-primary hover:bg-primary/10 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google ile Bağlan</span>
            </button>
          )}

          {/* Yükselt (Profil) */}
          {isLoggedIn && (
            <Link
              to="/profil"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-primary hover:bg-primary/10 transition-all mt-1"
            >
              <Sparkles size={20} className="shrink-0" />
              <span>Yükselt</span>
            </Link>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Separator */}
          <div className="border-t border-white/10 my-1" />

          {/* Theme Changer */}
          <div className="px-3 py-3">
            <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider mb-2 px-1">
              Tema
            </div>
            <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    title={opt.label}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
