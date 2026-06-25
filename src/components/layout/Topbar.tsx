import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ResponsiveLogo } from "./ResponsiveLogo";
import { Star, LogOut } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { navigationItems } from "@/lib/navigationItems";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import type { Theme } from "../../store/ui";
import { UnifiedUserMenu } from "./UnifiedUserMenu";

export function Topbar() {
  const { theme, setTheme } = useUIStore();
  const { user, login: handleLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const menuElement = document.getElementById("user-menu");
      if (menuElement && !menuElement.contains(e.target as Node)) {
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

  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleAvatarClose = () => {
    setDropdownOpen(false);
  };

  return (
    <header className="w-full h-14 border-b border-border/40 bg-card/15 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left: Branding & Navigation */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
          <ResponsiveLogo mobileSize={14} className="text-foreground shrink-0" />
        </Link>
        
        {/* Mobile Navigation: hidden on desktop, visible on mobile */}
        <div className="md:hidden">
          <MobileMenu items={navigationItems} />
        </div>
        
        {/* Desktop Navigation: visible on desktop (md: and up) */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              title={item.label}
            >
              <item.icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
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

        {/* Unified User Menu for all users */}
        <UnifiedUserMenu
          user={{
            user_metadata: {
              full_name: "Misafir",
              avatar_url: undefined,
            },
            email: "guest@example.com",
          }}
          isOpen={dropdownOpen}
          onToggle={handleAvatarClick}
          onClose={handleAvatarClose}
          onLogout={handleLogout}
          onNavigate={navigate}
          onThemeChange={handleThemeChange}
          currentTheme={theme}
          showAnonymousActions={!user}
          onAnonymousLogin={handleLogin}
        />

      </div>

    </header>
  );
}
