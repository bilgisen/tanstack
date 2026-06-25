import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Sparkles,
  Star,
  LogOut,
  ChartNoAxesCombined,
  Factory,
  Building2,
  Rss,
  FileText,
} from "lucide-react";
import { navigationItems } from "@/lib/navigationItems";

const iconMap: Record<string, React.ElementType> = {
  endeksler: ChartNoAxesCombined,
  sektorler: Factory,
  sirketler: Building2,
  haberler: Rss,
  raporlar: FileText,
};

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onLogout,
  isLoggedIn,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <span className="text-sm font-bold text-foreground">Menü</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col">
          {/* Yükselt Button */}
          <Link
            to="/panel/profil"
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 px-4 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98] mb-4"
          >
            <Sparkles size={16} />
            <span>Yükselt</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1 mb-4">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.id] || item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 my-1" />

          {/* Takip Listesi */}
          <Link
            to="/takip-listesi"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mb-1"
          >
            <Star size={18} className="shrink-0" />
            <span>Takip Listesi</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sign Out */}
          {isLoggedIn && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mb-2"
            >
              <LogOut size={18} className="shrink-0" />
              <span>Çıkış Yap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
