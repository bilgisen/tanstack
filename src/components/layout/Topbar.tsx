import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { User, LogOut, Search, Settings, MessageSquareWarning } from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export function Topbar() {
  const { user } = useAuth();
  const { setGlobalPrompt, openRightSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setGlobalPrompt(searchQuery.trim());
      openRightSidebar();
      setSearchQuery(""); // Temizle
    }
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
        <button 
          onClick={useUIStore.getState().openCommandPalette}
          className="relative flex items-center justify-between w-full h-12 bg-zinc-100 dark:bg-[#1a1c23] hover:bg-zinc-200 dark:hover:bg-[#22252d] transition-colors rounded-full overflow-hidden border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div className="flex items-center">
            <div className="pl-5 pr-3 text-zinc-500 dark:text-zinc-400">
              <Search size={18} className="stroke-[2.5]" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Hisse senedi, ETF ve daha fazlasını arayın...
            </span>
          </div>
          <div className="pr-4">
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-white dark:bg-zinc-800 px-2 text-[11px] font-medium text-zinc-500 border border-zinc-200 dark:border-zinc-700 font-sans shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
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
