import { Link } from "@tanstack/react-router";
import { User, Activity, LogOut, BotMessageSquare } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export function Topbar() {
  const { toggleRightSidebar, isRightSidebarOpen } = useUIStore();
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
    <header className="h-14 border-b dark:border-zinc-900 border-zinc-200 dark:bg-zinc-950 bg-white flex items-center justify-between px-4 shrink-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-emerald-500 font-bold text-lg tracking-tight">
          <Activity size={22} className="stroke-[2.5]" />
          <span>SumoTerminal</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <Link to="/borsa" className="text-sm font-medium dark:text-zinc-400 text-zinc-600 dark:hover:text-emerald-400 hover:text-emerald-600 transition-colors [&.active]:text-emerald-500 [&.active]:font-semibold">
          Borsa
        </Link>
        <Link to="/forex" className="text-sm font-medium dark:text-zinc-400 text-zinc-600 dark:hover:text-emerald-400 hover:text-emerald-600 transition-colors [&.active]:text-emerald-500 [&.active]:font-semibold">
          Forex
        </Link>
        <Link to="/emtia" className="text-sm font-medium dark:text-zinc-400 text-zinc-600 dark:hover:text-emerald-400 hover:text-emerald-600 transition-colors [&.active]:text-emerald-500 [&.active]:font-semibold">
          Emtia
        </Link>
        <Link to="/kripto" className="text-sm font-medium dark:text-zinc-400 text-zinc-600 dark:hover:text-emerald-400 hover:text-emerald-600 transition-colors [&.active]:text-emerald-500 [&.active]:font-semibold">
          Kripto
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleRightSidebar} 
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            isRightSidebarOpen 
              ? "text-emerald-500 bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:bg-emerald-500/10" 
              : "dark:text-zinc-400 text-zinc-600 dark:hover:bg-zinc-900 hover:bg-zinc-100"
          }`}
          title="AI Asistanı"
        >
          <BotMessageSquare size={18} />
        </button>
        
        {user ? (
          <div className="flex items-center gap-3 ml-2 dark:border-l dark:border-zinc-800 border-l border-zinc-200 pl-4">
            <div className="flex items-center gap-2">
              <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" className="w-8 h-8 rounded-full border dark:border-zinc-800 border-zinc-200" />
              <span className="hidden sm:inline text-sm dark:text-zinc-300 text-zinc-700 font-medium">{user.user_metadata?.full_name || user.email}</span>
            </div>
            <button onClick={handleLogout} className="dark:text-zinc-500 text-zinc-400 dark:hover:text-zinc-300 hover:text-zinc-600 transition-colors p-1" title="Çıkış Yap">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:border-zinc-800 border-zinc-200 border rounded-full px-3 py-1.5 text-sm transition-colors dark:text-zinc-300 text-zinc-700 font-medium">
            <User size={16} className="dark:text-zinc-400 text-zinc-500" />
            <span className="hidden sm:inline">Google Connect</span>
          </button>
        )}
      </div>
    </header>
  );
}
