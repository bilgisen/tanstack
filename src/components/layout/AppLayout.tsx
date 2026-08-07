import { useLocation } from "@tanstack/react-router";
import { CommandPalette } from "../ui/CommandPalette";
import { Topbar } from "./Topbar";
import { Bottombar } from "./Bottombar";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/sistemimiz";
  const isProfile = location.pathname.startsWith("/profil");
  const isPublicChat = location.pathname.startsWith("/sektorler") || location.pathname.startsWith("/endeksler") || location.pathname.startsWith("/takip-listesi");

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans transition-colors">
      <Topbar />
      <main className={`flex-1 bg-background relative z-0 ${
        isPublicChat || isProfile
          ? "overflow-hidden p-0 flex flex-col" 
          : isLanding
            ? "overflow-hidden p-0 flex flex-col"
            : "overflow-auto p-4 md:p-6"
      }`}>
        {children}
      </main>
      {!isLanding && <Bottombar />}
      <CommandPalette />
    </div>
  );
}
