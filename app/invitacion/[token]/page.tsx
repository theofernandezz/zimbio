import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getGroupByInviteToken } from "@/lib/services/groups";
import { AcceptInvitationCard } from "@/components/invitacion/accept-invitation-card";

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [group, session] = await Promise.all([
    getGroupByInviteToken(token),
    getSession(),
  ]);

  if (!group) notFound();

  const isFull = group.members.length >= group.maxMembers;
  const isMember = session
    ? group.members.some((m) => m.userId === session.userId)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="px-6 py-5 border-b border-border">
        <p className="text-lg font-bold text-primary">Zimbio</p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <AcceptInvitationCard
          group={group}
          token={token}
          isLoggedIn={!!session}
          isMember={isMember}
          isFull={isFull}
        />
      </main>

      <footer className="bg-muted/40 border-t border-border px-6 py-5">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm font-bold text-primary">Zimbio</p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 Zimbio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
