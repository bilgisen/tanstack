import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { CommandPalette } from "../ui/CommandPalette";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans transition-colors">
      <Topbar />
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-background relative z-0">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
