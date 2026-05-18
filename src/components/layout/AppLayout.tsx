import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { Bottombar } from "./Bottombar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <main className="flex-1 overflow-auto bg-zinc-950/50 p-4 relative z-0">
          {children}
        </main>
        <RightSidebar />
      </div>
      <Bottombar />
    </div>
  );
}
