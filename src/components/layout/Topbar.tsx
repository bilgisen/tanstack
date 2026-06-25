import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ResponsiveLogo } from "./ResponsiveLogo";
import { Menu } from "lucide-react";
import { MobileDrawer } from "./MobileDrawer";
import { navigationItems } from "@/lib/navigationItems";
import { useAuth } from "../../hooks/useAuth";
import { ProfileAvatar } from "./ProfileAvatar";

export function Topbar() {
  const { user, login: handleLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleAvatarClick = () => {
    if (user) {
      navigate({ to: "/panel/profil" });
    } else {
      handleLogin();
    }
  };

  return (
    <header className="w-full h-14 border-b border-white/10 bg-background/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
      
      {/* Left: Branding & Navigation */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
          <ResponsiveLogo mobileSize={16} className="text-foreground shrink-0" />
        </Link>
        
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
        
        {/* Mobile: Hamburger Menu */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
          aria-label="Menüyü aç"
        >
          <Menu size={20} className="text-muted-foreground" />
        </button>

        {/* Avatar or Google Icon */}
        {user ? (
          <button
            onClick={handleAvatarClick}
            className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            title="Profil"
          >
            <ProfileAvatar user={user} size="sm" />
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
            title="Google ile Giriş Yap"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        isLoggedIn={!!user}
      />
    </header>
  );
}
