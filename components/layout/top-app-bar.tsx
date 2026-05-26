"use client";

import { Bell } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

/** Mobile-only top bar — hidden on md+ (sidebar takes over). */
export function TopAppBar() {
  const user = useCurrentUser();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-secondary/80 backdrop-blur-sm border-b border-border px-5 h-14">
      {/* Avatar */}
      <div
        className="flex items-center justify-center size-9 rounded-full text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: user?.avatarColor ?? "#0061FF" }}
        aria-label={`Avatar de ${user?.name ?? "usuario"}`}
      >
        {user?.avatarInitials ?? "?"}
      </div>

      {/* Brand */}
      <span className="text-xl font-bold tracking-tight text-primary">Zimbio</span>

      {/* Notifications */}
      <button
        className="flex items-center justify-center size-9 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notificaciones"
      >
        <Bell className="size-5" />
      </button>
    </header>
  );
}
