"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Vault, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const NAV_ITEMS = [
  { label: "Grupos",   href: "/grupos",   Icon: Users },
  { label: "Vault",    href: "/vault",    Icon: Vault },
  { label: "Ajustes",  href: "/settings", Icon: Settings },
] as const;

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    localStorage.removeItem("zimbio_user");
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen overflow-hidden bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <span className="text-xl font-bold tracking-tight text-primary">Zimbio</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div
              className="flex items-center justify-center size-8 rounded-full text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="size-4.5 shrink-0" strokeWidth={1.8} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
