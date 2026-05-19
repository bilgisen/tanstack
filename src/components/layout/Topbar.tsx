import { Link } from "@tanstack/react-router";
import { User, LogOut, Search, Settings, MessageSquareWarning } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export function Topbar() {
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
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0f1115] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-colors">
      
      {/* Left: Logo Area */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <Link to="/" className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">
          <span className="font-bold">Sumo</span>
          <span className="font-normal text-zinc-600 dark:text-zinc-300">Terminal</span>
        </Link>
        <span className="text-[10px] font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded px-1.5 py-0.5 ml-1 mt-0.5">
          Beta
        </span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-[720px] mx-4 hidden md:block">
        <div className="relative flex items-center w-full h-12 bg-zinc-100 dark:bg-[#1a1c23] hover:bg-zinc-200 dark:hover:bg-[#22252d] transition-colors rounded-full overflow-hidden border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:bg-white dark:focus-within:bg-[#1a1c23]">
          <div className="pl-5 pr-3 text-zinc-500 dark:text-zinc-400">
            <Search size={18} className="stroke-[2.5]" />
          </div>
          <input 
            type="text" 
            placeholder="Hisse senedi, ETF ve daha fazlasını arayın" 
            className="w-full h-full bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        {/* Toggle Mode (Klasik / Beta) */}
        <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-[#1a1c23] rounded-full p-0.5 border border-zinc-200 dark:border-zinc-800/50">
          <button className="px-4 py-1.5 text-xs font-medium rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            Klasik
          </button>
          <button className="px-4 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-[#2a2d36] text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Beta
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1a1c23] rounded-full transition-colors" title="Ayarlar">
          <Settings size={20} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#1a1c23] rounded-full transition-colors" title="Geri Bildirim">
          <MessageSquareWarning size={20} />
        </button>
        
        {user ? (
          <div className="flex items-center gap-2 ml-1 cursor-pointer" onClick={handleLogout} title="Çıkış Yap">
            <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
          </div>
        ) : (
          <button onClick={handleLogin} className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors ml-1" title="Giriş Yap">
            <User size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
