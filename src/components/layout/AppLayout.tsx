import type { ReactNode } from "react";
import { CommandPalette } from "../ui/CommandPalette";
import { useLocation } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isPanel = location.pathname.startsWith("/panel");

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans transition-colors">
      <main className={`flex-1 bg-background relative z-0 ${
        isLanding 
          ? "overflow-auto" 
          : isPanel 
            ? "overflow-hidden p-0 flex flex-col" 
            : "overflow-auto p-4 md:p-6"
      }`}>
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
