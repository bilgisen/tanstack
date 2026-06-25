import type { ReactNode } from "react";
import { CommandPalette } from "../ui/CommandPalette";
import { useLocation } from "@tanstack/react-router";
import { Topbar } from "./Topbar";
import { Bottombar } from "./Bottombar";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isPanel = location.pathname.startsWith("/panel");
  const isProfile = location.pathname.startsWith("/profil");
  const isPublicChat = location.pathname.startsWith("/sektorler") || location.pathname.startsWith("/sirketler") || location.pathname.startsWith("/endeksler");

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans transition-colors">
      <Topbar />
      <main className={`flex-1 bg-background relative z-0 ${
        isLanding || isProfile
          ? "overflow-auto" 
          : isPanel || isPublicChat
            ? "overflow-hidden p-0 flex flex-col" 
            : "overflow-auto p-4 md:p-6"
      }`}>
        {children}
      </main>
      <Bottombar />
      <CommandPalette />
    </div>
  );
}
