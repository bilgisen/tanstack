import { Link } from "@tanstack/react-router";
import { Menu, Search, User, Activity, LogOut } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export function Topbar() {
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const { user } = useAuth();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error("Login failed:", error);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={toggleMobileMenu}>
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-emerald-500 font-bold text-lg tracking-tight">
          <Activity size={24} />
          <span>SumoTerminal</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center max-w-md w-full px-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Arama yap: sembol, haber, analiz..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-700" />
              <span className="hidden sm:inline text-sm text-zinc-300 font-medium">{user.user_metadata?.full_name || user.email}</span>
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1" title="Çıkış Yap">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-3 py-1.5 text-sm transition-colors text-zinc-300">
            <User size={16} className="text-zinc-400" />
            <span className="hidden sm:inline">Google Connect</span>
          </button>
        )}
      </div>
    </header>
  );
}
