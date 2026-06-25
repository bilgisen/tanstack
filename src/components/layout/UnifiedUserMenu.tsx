import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { useUIStore } from "../../store/ui";
import type { Theme } from "../../store/ui";

export interface UnifiedUserMenuProps {
  user: {
    user_metadata: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
    email: string;
  };
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onThemeChange: (theme: Theme) => void;
  currentTheme: Theme;
  showAnonymousActions?: boolean;
  onAnonymousLogin?: () => void;
}

export function UnifiedUserMenu({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  onNavigate,
  onThemeChange,
  currentTheme,
  showAnonymousActions = false,
  onAnonymousLogin,
}: UnifiedUserMenuProps): React.JSX.Element {
  const navigate = useNavigate();
  const { theme, setTheme } = useUIStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Outside click detection
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveIndex(-1);
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      const itemsCount = menuItemsRef.current.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const newIndex = activeIndex < itemsCount - 1 ? activeIndex + 1 : 0;
          setActiveIndex(newIndex);
          // Focus the element after state update
          setTimeout(() => {
            menuItemsRef.current[newIndex]?.focus();
          }, 0);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const newIndex = activeIndex > 0 ? activeIndex - 1 : itemsCount - 1;
          setActiveIndex(newIndex);
          // Focus the element after state update
          setTimeout(() => {
            menuItemsRef.current[newIndex]?.focus();
          }, 0);
          break;
        }
        case "Home": {
          e.preventDefault();
          setActiveIndex(0);
          setTimeout(() => {
            menuItemsRef.current[0]?.focus();
          }, 0);
          break;
        }
        case "End": {
          e.preventDefault();
          setActiveIndex(itemsCount - 1);
          setTimeout(() => {
            menuItemsRef.current[itemsCount - 1]?.focus();
          }, 0);
          break;
        }
        case "Escape": {
          e.preventDefault();
          setActiveIndex(-1);
          onClose();
          buttonRef.current?.focus();
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < itemsCount) {
            const item = menuItemsRef.current[activeIndex];
            item?.click();
          }
          break;
        }
      }
    },
    [isOpen, activeIndex, onClose]
  );

  // Handle theme change and close menu
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setActiveIndex(-1);
    onClose();
  };

  // Handle logout and close menu
  const handleLogout = () => {
    setActiveIndex(-1);
    onClose();
    onLogout();
  };

  // Handle profile navigation
  const handleProfileNavigate = () => {
    setActiveIndex(-1);
    onClose();
    navigate({ to: "/panel/profil" });
  };

  // Theme options
  const themeOptions = [
    { id: "light", label: "Açık", icon: Sun, theme: "light" as Theme },
    { id: "dark", label: "Koyu", icon: Moon, theme: "dark" as Theme },
    { id: "system", label: "Sistem", icon: Monitor, theme: "system" as Theme },
  ];

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      {/* Clickable avatar */}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center gap-2 w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        title={user.email || "Profil"}
      >
        <ProfileAvatar user={user} size="sm" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="user-menu"
          role="menu"
          aria-labelledby={buttonRef.current?.id}
          aria-hidden={!isOpen}
          className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
          tabIndex={-1}
        >
          {!showAnonymousActions && (
            <>
              {/* Profil */}
              <button
                ref={(el) => (menuItemsRef.current[0] = el)}
                onClick={handleProfileNavigate}
                role="menuitem"
                tabIndex={activeIndex === 0 ? 0 : -1}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <User size={14} className="shrink-0" />
                <span>Profil</span>
              </button>

              <div className="border-t border-border/30 my-1" />
            </>
          )}

          {/* Tema */}
          <div className="text-[10px] font-bold text-muted-foreground/65 uppercase tracking-wider px-3 pb-1.5 pt-1">
            {showAnonymousActions ? "Görünüm Teması" : "Tema"}
          </div>

          {themeOptions.map((themeOption, index) => {
            const isSelected = currentTheme === themeOption.theme;
            return (
              <button
                key={themeOption.id}
                ref={(el) => (menuItemsRef.current[index + (showAnonymousActions ? 0 : 1)] = el)}
                onClick={() => handleThemeChange(themeOption.theme)}
                role="menuitem"
                tabIndex={activeIndex === index + (showAnonymousActions ? 0 : 1) ? 0 : -1}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              >
                <div className="flex items-center gap-2">
                  <themeOption.icon size={14} className="shrink-0" />
                  <span>{themeOption.label}</span>
                </div>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}

          {!showAnonymousActions && (
            <div className="border-t border-border/30 my-1" />
          )}

          {showAnonymousActions && onAnonymousLogin && (
            <button
              ref={(el) => (menuItemsRef.current[themeOptions.length + (showAnonymousActions ? 1 : 0)] = el)}
              onClick={() => {
                setActiveIndex(-1);
                onClose();
                onAnonymousLogin?.();
              }}
              role="menuitem"
              tabIndex={activeIndex === themeOptions.length + (showAnonymousActions ? 1 : 0) ? 0 : -1}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <svg size={14} className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
              <span>Giriş Yap</span>
            </button>
          )}

          {!showAnonymousActions && (
            <div className="border-t border-border/30 my-1" />
          )}

          {/* Çıkış Yap */}
          {!showAnonymousActions && (
            <button
              ref={(el) => (menuItemsRef.current[themeOptions.length + 1] = el)}
              onClick={handleLogout}
              role="menuitem"
              tabIndex={activeIndex === themeOptions.length + 1 ? 0 : -1}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all font-medium text-left cursor-pointer text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Çıkış Yap</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
