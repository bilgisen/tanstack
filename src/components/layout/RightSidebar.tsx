import { MessageSquare, X, Send } from "lucide-react";
import { useUIStore } from "../../store/ui";

export function RightSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden md:flex flex-col border-l border-zinc-800 bg-zinc-950/80 backdrop-blur-md transition-all duration-300
        ${isRightSidebarOpen ? "w-80" : "w-0 overflow-hidden border-none"}
      `}>
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-emerald-500 font-medium">
            <MessageSquare size={18} />
            <span>AI Asistan</span>
          </div>
          <button onClick={toggleRightSidebar} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
            Merhaba! Ben finansal analiz asistanınızım. Dolar kuru, hisse senedi detayları veya piyasa trendleri hakkında bana sorular sorabilirsiniz.
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Sorunuzu yazın..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400">
              <Send size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile FAB */}
      <button 
        className="md:hidden fixed bottom-16 right-4 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 z-50 text-white"
        onClick={toggleRightSidebar}
      >
        <MessageSquare size={20} />
      </button>

      {/* Mobile Chat Bottom Sheet (Basic Implementation) */}
      {isRightSidebarOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 h-[80vh] bg-zinc-950 border-t border-zinc-800 z-50 flex flex-col rounded-t-2xl shadow-2xl">
          <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-emerald-500 font-medium">
              <MessageSquare size={18} />
              <span>AI Asistan</span>
            </div>
            <button onClick={toggleRightSidebar} className="text-zinc-500 hover:text-zinc-300">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
              Merhaba! Mobilden size nasıl yardımcı olabilirim?
            </div>
          </div>
          <div className="p-4 border-t border-zinc-800 bg-zinc-950">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Sorunuzu yazın..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
