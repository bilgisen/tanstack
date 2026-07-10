import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../../store/ui";
import { Search, X, Command, TrendingUp, Clock, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, setGlobalPrompt, openRightSidebar } = useUIStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().openCommandPalette();
      }
      if (e.key === "Escape") {
        closeCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCommandPalette]);

  useEffect(() => {
    if (isCommandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleAskAI = () => {
    if (!query.trim()) return;
    setGlobalPrompt(query);
    openRightSidebar();
    closeCommandPalette();
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    closeCommandPalette();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeCommandPalette}
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            placeholder="Hisse senedi, sektör veya yapay zekaya bir soru sorun..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAskAI();
            }}
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 text-[10px] font-medium text-zinc-500 font-sans">
              <span className="text-xs">esc</span>
            </kbd>
            <button onClick={closeCommandPalette} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          
          {query.trim().length > 0 && (
            <div className="p-2">
              <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Jetborsa AI'a Sor</h3>
              <button 
                onClick={handleAskAI}
                className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Command className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <span className="font-medium">"{query}"</span>
                  <span className="text-sm opacity-80 ml-2">hakkında analiz iste</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {!query.trim() && (
            <>
              <div className="p-2">
                <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Son Aramalar
                </h3>
                <div className="space-y-1">
                  <button onClick={() => handleNavigate('/endeksler/xu100')} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>BIST 100 Teknik Analizi</span>
                  </button>
                  <button onClick={() => handleNavigate('/')} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>USD/TRY Destek Seviyeleri</span>
                  </button>
                </div>
              </div>

              <div className="p-2 mt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Popüler Piyasalar
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {['THYAO', 'TUPRS', 'XAUUSD', 'BTCUSD'].map(ticker => (
                    <button key={ticker} onClick={() => handleNavigate('/')} className="flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 transition-colors">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">{ticker}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">↵</kbd> seç</span>
            <span className="flex items-center gap-1"><kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">↑↓</kbd> gezin</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <Command className="w-3 h-3" /> Jetborsa AI
          </div>
        </div>

      </div>
    </div>
  );
}
