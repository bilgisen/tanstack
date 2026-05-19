import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { Bottombar } from "./Bottombar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col dark:bg-zinc-950 bg-zinc-50 dark:text-zinc-50 text-zinc-900 overflow-hidden font-sans transition-colors">
      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <main className="flex-1 overflow-auto dark:bg-zinc-950/20 bg-zinc-100/10 p-6 relative z-0">
          {children}
        </main>
        <RightSidebar />
      </div>
      <Bottombar />
    </div>
  );
}

