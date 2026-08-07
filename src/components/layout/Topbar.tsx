import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ResponsiveLogo } from "./ResponsiveLogo";
import { MobileDrawer } from "./MobileDrawer";
import { ProfileAvatar } from "./ProfileAvatar";
import { navigationItems } from "@/lib/navigationItems";

export function Topbar() {
  const { user, login: handleLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleAvatarClick = () => {
    if (user) {
      navigate({ to: "/profil" });
    }
  };

  return (
    <>
      <header className="w-full h-14 border-b border-white/10 bg-background/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-30">
        
        {/* Left: Branding & Navigation */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 select-none hover:opacity-95 transition-all">
            <ResponsiveLogo mobileSize={28} className="text-foreground shrink-0" textClassName="uppercase" textStyle={{ fontWeight: 400 }} />
            <span className="-ml-1.5 self-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20 leading-none">
              beta
            </span>
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
           
           {/* Avatar (logged in only, mounted check for hydration) */}
           {mounted && user && (
             <button
               onClick={handleAvatarClick}
               className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
               title="Profil"
             >
                <ProfileAvatar user={{ ...user, user_metadata: { ...user.user_metadata, avatar_url: user.user_metadata.avatar_url ?? undefined } }} size="sm" />
             </button>
           )}

            {/* Upgrade Button */}
            <Link
              to="/profil"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground hover:opacity-90 transition-all cursor-pointer text-xs font-medium shrink-0"
              title="Yükselt"
            >
              <span>Yükselt</span>
            </Link>

           {/* Hamburger Menu */}
           <button
             onClick={() => setDrawerOpen(true)}
             className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
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
