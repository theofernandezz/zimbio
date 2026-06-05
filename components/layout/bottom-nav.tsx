"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, KeyRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Grupos",   href: "/grupos",   Icon: Users },
  { label: "Accesos",  href: "/accesos",  Icon: KeyRound },
  { label: "Ajustes",  href: "/settings", Icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden sticky bottom-0 z-40 flex items-center justify-around bg-card/95 backdrop-blur-sm border-t border-border h-16 px-2">
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg px-3 py-1 transition-colors",
                active && "bg-primary/10",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span className={cn("text-[11px] font-medium", active && "font-semibold")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
