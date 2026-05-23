import { Link, useLocation } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function Topbar() {
  const { user, login: handleLogin, logout: handleLogout } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header 
      className={`h-12 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 transition-all duration-300 ${
        isLanding 
          ? "absolute top-0 left-0 right-0 bg-transparent border-none shadow-none" 
          : "border-b border-border bg-card/90 backdrop-blur-md text-card-foreground shadow-2xs"
      }`}
    >
      
      {/* Left: Logo Area */}
      <div className="flex items-center gap-2">
        <Link 
          to={user ? "/panel" : "/"} 
          className="flex items-center gap-1 text-foreground hover:opacity-90 transition-opacity text-base font-bold tracking-tight"
        >
          <span>hissepro</span>
        </Link>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={handleLogout} 
            title="Çıkış Yap"
          >
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
              Çıkış Yap
            </span>
            <img 
              src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt="Avatar" 
              className="w-6 h-6 rounded-full border border-border bg-card shadow-2xs group-hover:border-primary transition-all duration-300" 
            />
          </div>
        ) : (
          !isLanding && (
            <button 
              onClick={handleLogin} 
              className="flex items-center justify-center px-3 py-1 text-[11px] font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer" 
              title="Giriş Yap"
            >
              <User size={12} className="mr-1" />
              Giriş Yap
            </button>
          )
        )}
      </div>
      
    </header>
  );
}
