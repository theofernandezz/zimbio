import { requireAuth } from "@/lib/auth";
import { userService, type UserPublic } from "@/lib/services/users";
import { TopAppBar } from "./top-app-bar";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth();
  const user = await userService.findById(userId);

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <SideNav user={user} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopAppBar user={user} />

        <main className="flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

export type { UserPublic };
