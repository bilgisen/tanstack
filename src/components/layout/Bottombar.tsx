import { Sun, Moon, Monitor } from "lucide-react";
import { useUIStore } from "../../store/ui";
import type { Theme } from "../../store/ui";


export function Bottombar() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);


  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Açık" },
    { value: "dark", icon: Moon, label: "Koyu" },
    { value: "system", icon: Monitor, label: "Sistem" },
  ];

  return (
    <footer className="h-8 border-t border-white/10 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 select-none transition-colors z-10">
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/70 mr-1.5">Jetborsa</span>
        <span>© 2026 | Yapay Zekayla Güçlendirilmiş Finans Platformu</span>
      </div>

      <div className="flex items-center gap-1 h-full relative shrink-0">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              title={opt.label}
              className={`w-6 h-6 flex items-center justify-center rounded transition-all cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={12} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
            </button>
          );
        })}
      </div>
    </footer>
  );
}
