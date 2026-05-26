import { TopAppBar } from "./top-app-bar";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";

/**
 * Authenticated app shell.
 *
 * Desktop (md+): SideNav fija a la izquierda + contenido a la derecha.
 * Mobile:        TopAppBar + contenido + BottomNav.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Desktop sidebar */}
      <SideNav />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <TopAppBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}
