import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../ui/CommandPalette";
import { useLocation } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans transition-colors">
      <Topbar />
      <main className={`flex-1 overflow-auto bg-background relative z-0 ${isLanding ? "" : "p-4 md:p-6"}`}>
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
