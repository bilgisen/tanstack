import { Link } from "@tanstack/react-router";
import { LayoutDashboard, TrendingUp, Coins, CandlestickChart, Bitcoin } from "lucide-react";
import { useUIStore } from "../../store/ui";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: TrendingUp, label: "Forex", to: "/forex" },
  { icon: Coins, label: "Emtia", to: "/emtia" },
  { icon: CandlestickChart, label: "Borsa", to: "/borsa" },
  { icon: Bitcoin, label: "Kripto", to: "/kripto" },
];

export function LeftSidebar() {
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);

  return (
    <aside className={`
      absolute md:relative z-20 flex flex-col w-64 h-full bg-zinc-950 border-r border-zinc-800 transition-transform duration-300
      ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}>
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Piyasalar</div>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors [&.active]:text-emerald-400 [&.active]:bg-emerald-400/10 [&.active]:font-medium"
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
