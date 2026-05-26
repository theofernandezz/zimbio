"use client";

import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingShellProps {
  children: React.ReactNode;
  /** Show a back arrow that goes to the previous route */
  showBack?: boolean;
  /** Override the back destination (default: router.back()) */
  backHref?: string;
  /** Constrain content width. Default: "md" */
  contentWidth?: "sm" | "md" | "lg" | "full";
}

const WIDTH_MAP = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  full: "w-full",
} as const;

export function OnboardingShell({
  children,
  showBack = false,
  backHref,
  contentWidth = "md",
}: OnboardingShellProps) {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zimbio_user");
    }
    router.push("/login");
  }

  function handleBack() {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header — brand + optional back + logout */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <span className="text-lg font-bold tracking-tight text-primary">Zimbio</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* Content */}
      <div className={cn("flex-1 flex flex-col px-5 py-8 mx-auto w-full", WIDTH_MAP[contentWidth])}>
        {children}
      </div>
    </div>
  );
}
