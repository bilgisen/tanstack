import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Folder, 
  History, 
  Clock, 
  Plus, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronRight, 
  CornerDownRight 
} from "lucide-react";
import { useUIStore } from "../../store/ui";
import { useChatStore } from "../../store/chat";

type SubItem = {
  name: string;
  route: string;
  time: string;
  isUp?: boolean;
};

type StockFolder = {
  code: string;
  display_name: string;
  route: string;
  subItems: SubItem[];
};

export function LeftSidebar() {
  const { isLeftSidebarExpanded, toggleLeftSidebarExpanded } = useUIStore();
  
  // Local state to toggle stock folders in explorer view
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "XU100": true,
    "THYAO": true,
    "TUPRS": true,
    "EREGL": false,
  });

  const toggleFolder = (code: string) => {
    setExpandedFolders(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const folders: StockFolder[] = [
    {
      code: "XU100",
      display_name: "bist-endeks",
      route: "/panel/endeksler/bist100",
      subItems: [
        { name: "BIST 100 Detay", route: "/panel/endeksler/bist100", time: "2s", isUp: true },
        { name: "BIST 30 Detay", route: "/panel/endeksler/bist30", time: "4s", isUp: true },
      ]
    },
    {
      code: "THYAO",
      display_name: "thyao-havayollari",
      route: "/panel/sirketler/thyao",
      subItems: [
        { name: "Hisse Analiz Raporu", route: "/panel/sirketler/thyao", time: "1g", isUp: true }
      ]
    },
    {
      code: "TUPRS",
      display_name: "tupras-petrol",
      route: "/panel/sirketler/tuprs",
      subItems: [
        { name: "Hisse Analiz Raporu", route: "/panel/sirketler/tuprs", time: "5g", isUp: false }
      ]
    },
    {
      code: "EREGL",
      display_name: "eregli-demir",
      route: "/panel/sirketler/eregl",
      subItems: [
        { name: "Hisse Analiz Raporu", route: "/panel/sirketler/eregl", time: "9g", isUp: false }
      ]
    }
  ];

  return (
    <aside className={`
      flex flex-col border-r border-border bg-card text-card-foreground shrink-0 transition-all duration-300 h-full overflow-hidden select-none
      fixed inset-y-0 left-0 z-50 lg:static
      ${isLeftSidebarExpanded 
        ? "w-[260px] translate-x-0" 
        : "w-0 -translate-x-full lg:translate-x-0 border-r-0"
      }
    `}>
      {/* Sidebar Inner Content (Handles overflow perfectly) */}
      <div className="flex-1 flex flex-col h-full p-4 space-y-5 overflow-y-auto custom-scrollbar">
        
        {/* Top Controls (Simulating Window buttons / Navigation from first screenshot) */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Collapse Button */}
            <button 
              onClick={toggleLeftSidebarExpanded}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
              title="Kapat"
            >
              <ChevronRight size={15} className="rotate-180" />
            </button>
            
            {/* Arrow Navs */}
            <div className="flex items-center gap-0.5 opacity-60">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 rounded-md">
                <span className="text-xs">←</span>
              </div>
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 rounded-md">
                <span className="text-xs">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. New Conversation Button */}
        <button
          onClick={() => {
            useChatStore.getState().clearChat();
            if (window.innerWidth < 1024) toggleLeftSidebarExpanded();
          }}
          className="w-full flex items-center justify-start gap-2.5 bg-muted/40 hover:bg-muted/80 text-foreground border border-border/80 hover:border-border rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98] shrink-0"
        >
          <span className="text-primary font-bold text-base leading-none">+</span>
          <span>Yeni Sohbet</span>
        </button>

        {/* 2. Primary Navigation Menu */}
        <div className="space-y-0.5 shrink-0">
          <Link
            to="/panel"
            onClick={() => { if (window.innerWidth < 1024) toggleLeftSidebarExpanded(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all group"
          >
            <History size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Sohbet Geçmişi</span>
          </Link>
          <Link
            to="/panel"
            onClick={() => { if (window.innerWidth < 1024) toggleLeftSidebarExpanded(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all group"
          >
            <Clock size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Planlanmış Görevler</span>
          </Link>
        </div>

        {/* 3. Folder Explorer section (Projects) */}
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {/* Section Header */}
          <div className="flex items-center justify-between px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none shrink-0">
            <span>Takip Listesi</span>
            <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <SlidersHorizontal size={10} className="cursor-pointer" />
              <Plus size={10} className="cursor-pointer" />
            </div>
          </div>

          {/* Folder List Container (Sleek Scrollable Area) */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
            {folders.map((folder) => {
              const isExpanded = expandedFolders[folder.code];
              return (
                <div key={folder.code} className="space-y-0.5">
                  {/* Folder Row */}
                  <div
                    onClick={() => toggleFolder(folder.code)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer transition-colors group"
                  >
                    {isExpanded ? (
                      <ChevronDown size={12} className="text-muted-foreground/60 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
                    )}
                    <Folder size={13} className="text-muted-foreground/70 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="truncate">{folder.display_name}</span>
                  </div>

                  {/* Nested Sub-items (Renders only if expanded) */}
                  {isExpanded && (
                    <div className="pl-6 space-y-0.5">
                      {folder.subItems.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.route as any}
                          onClick={() => { if (window.innerWidth < 1024) toggleLeftSidebarExpanded(); }}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted/30 text-muted-foreground/80 hover:text-foreground text-[11px] font-medium transition-all group"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CornerDownRight size={11} className="text-muted-foreground/40 shrink-0" />
                            <span className="truncate group-hover:text-primary transition-colors">{sub.name}</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold shrink-0 ml-1.5 opacity-80 group-hover:opacity-100 ${
                            sub.isUp ? "text-emerald-500" : "text-destructive"
                          }`}>
                            {sub.time}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
}
