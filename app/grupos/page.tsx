"use client";

import { useRouter } from "next/navigation";
import { Plus, ChevronRight, CheckCircle2, Clock, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS } from "@/lib/types";
import { useAllGroups } from "@/lib/hooks/use-all-groups";
import type { Group } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatARS } from "@/lib/tax-engine";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, isAdmin, userId }: { group: Group; isAdmin: boolean; userId: string }) {
  const router = useRouter();

  const nonAdminMembers = group.members.slice(1);
  const paidCount = nonAdminMembers.filter(m => m.paymentStatus === PAYMENT_STATUS.Paid).length;
  const allPaid = paidCount === nonAdminMembers.length;

  const href = isAdmin
    ? `/dashboard/admin?groupId=${group.id}`
    : `/dashboard/participante?groupId=${group.id}`;

  // For participant: find their own member entry to show their payment status
  const myEntry = isAdmin ? null : group.members.find(m => m.user.id === userId);
  const myIsPaid = myEntry?.paymentStatus === PAYMENT_STATUS.Paid;

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        "w-full text-left rounded-2xl border bg-card shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "p-4 flex items-center gap-4"
      )}
    >
      {/* Logo(s) — stacked when multi-service */}
      {group.services && group.services.length > 1 ? (
        <div className="flex -space-x-2.5 shrink-0">
          {group.services.slice(0, 3).map((svc, i) => (
            <ServiceLogo
              key={svc.id}
              service={svc.type}
              className="size-12 rounded-xl ring-2 ring-card"
              style={{ zIndex: group.services!.length - i }}
            />
          ))}
        </div>
      ) : (
        <ServiceLogo service={group.service.type} className="size-12 rounded-xl shrink-0" />
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
          <span className={cn(
            "text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0",
            isAdmin ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          )}>
            {isAdmin ? "Admin" : "Participante"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{group.billingCycle}</p>

        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3 shrink-0" />
            {group.members.length} miembros
          </span>

          {isAdmin ? (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              allPaid ? "text-emerald-600" : "text-amber-600"
            )}>
              {allPaid
                ? <><CheckCircle2 className="size-3" />Todos pagaron</>
                : <><Clock className="size-3" />{paidCount}/{nonAdminMembers.length} pagaron</>
              }
            </span>
          ) : (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              myIsPaid ? "text-emerald-600" : "text-amber-600"
            )}>
              {myIsPaid
                ? <><CheckCircle2 className="size-3" />Al día</>
                : <><Clock className="size-3" />Pago pendiente · {formatARS(myEntry?.amountDue ?? 0)}</>
              }
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GruposPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const allGroups = useAllGroups();

  // Wait for user to load from localStorage
  if (!user) return null;

  // Groups where the user is the admin
  const adminGroups = allGroups.filter(g => g.admin.id === user.id);

  // Groups where the user is a member but NOT the admin
  const participantGroups = allGroups.filter(
    g => g.admin.id !== user.id && g.members.some(m => m.user.id === user.id)
  );

  const hasGroups = adminGroups.length > 0 || participantGroups.length > 0;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis grupos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Hola, {user.name.split(" ")[0]}</p>
          </div>
          <Button onClick={() => router.push("/grupos/crear")} className="gap-2 shrink-0" size="sm">
            <Plus className="size-4" />
            Crear grupo
          </Button>
        </div>

        {/* ── Groups list ── */}
        {hasGroups ? (
          <div className="space-y-6">
            {adminGroups.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Administrás
                </p>
                <div className="space-y-3">
                  {adminGroups.map(group => (
                    <GroupCard key={group.id} group={group} isAdmin userId={user.id} />
                  ))}
                </div>
              </section>
            )}

            {participantGroups.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Participás
                </p>
                <div className="space-y-3">
                  {participantGroups.map(group => (
                    <GroupCard key={group.id} group={group} isAdmin={false} userId={user.id} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
            <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Users className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">No tenés grupos todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                Creá uno o unite con un link de invitación
              </p>
            </div>
            <Button onClick={() => router.push("/grupos/crear")} className="gap-2">
              <Plus className="size-4" />
              Crear mi primer grupo
            </Button>
          </div>
        )}

      </div>
    </AppShell>
  );
}
