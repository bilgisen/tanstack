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
    }
  };

  return (
    <>
      <header className="w-full h-14 border-b border-white/10 bg-background/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
        
        {/* Left: Branding & Navigation */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
            <ResponsiveLogo mobileSize={26} className="text-foreground shrink-0" />
          </Link>
          
          {/* Desktop Navigation */}
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
          
          {/* Avatar (logged in only) */}
          {user && (
            <button
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Profil"
            >
              <ProfileAvatar user={user} size="sm" />
            </button>
          )}

          {/* Mobile: Hamburger Menu (far right) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Menüyü aç"
          >
            <Menu size={22} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer - rendered outside header to avoid z-index issues */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        onLogin={handleLogin}
        isLoggedIn={!!user}
      />
    </>
  );
}
