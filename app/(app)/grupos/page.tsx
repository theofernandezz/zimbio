import Link from "next/link";
import { Plus, ChevronRight, CheckCircle2, Clock, Users, DollarSign, Shield, Share2 } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getGroupsByUser, type GroupSummary } from "@/lib/services/groups";
import { userService } from "@/lib/services/users";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { JoinViaLinkButton } from "@/components/grupos/join-via-link-button";
import { AnimatedGroupList, AnimatedGroupItem } from "@/components/grupos/animated-group-list";
import { formatARS } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({
  group,
  isAdmin,
  userId,
}: {
  group: GroupSummary;
  isAdmin: boolean;
  userId: string;
}) {
  const totalMembers = group.members.length;
  const paidCount = group.members.filter((m) => m.paymentStatus === "paid").length;
  const allPaid = paidCount === totalMembers && totalMembers > 0;

  const myMember = isAdmin ? null : group.members.find((m) => m.userId === userId);
  const myIsPaid = myMember?.paymentStatus === "paid";

  const href = isAdmin
    ? `/dashboard/admin?groupId=${group.id}`
    : `/dashboard/participante?groupId=${group.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "w-full text-left rounded-2xl border bg-card shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "p-4 flex items-center gap-4",
      )}
    >
      <div className="flex -space-x-2 shrink-0">
        {group.servicePlans.slice(0, 2).map((sp) => (
          <ServiceLogo
            key={sp.id}
            service={sp.service.type}
            className="size-12 rounded-xl ring-2 ring-background"
          />
        ))}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">
            {group.name}
          </p>
          <span
            className={cn(
              "text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0",
              isAdmin
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {isAdmin ? "Admin" : "Participante"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {group.billingCycle} · {group.servicePlans.map((sp) => sp.service.name).join(" + ")}
        </p>

        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3 shrink-0" />
            {totalMembers}/{group.maxMembers} miembros
          </span>

          {isAdmin ? (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                allPaid ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {allPaid ? (
                <><CheckCircle2 className="size-3" />Todos pagaron</>
              ) : (
                <><Clock className="size-3" />{paidCount}/{totalMembers} pagaron</>
              )}
            </span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                myIsPaid ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {myIsPaid ? (
                <><CheckCircle2 className="size-3" />Al día</>
              ) : (
                <><Clock className="size-3" />Pendiente · {formatARS(myMember?.amountDue ?? 0)}</>
              )}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GruposPage() {
  const { userId } = await requireAuth();

  const [user, { adminGroups, participantGroups }] = await Promise.all([
    userService.findById(userId),
    getGroupsByUser(userId),
  ]);

  const hasGroups = adminGroups.length > 0 || participantGroups.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mis grupos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Hola, {user?.name.split(" ")[0]}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <JoinViaLinkButton />
            <Button asChild size="sm" className="gap-2">
              <Link href="/grupos/crear">
                <Plus className="size-4" />
                Crear grupo
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Lista ── */}
        {hasGroups ? (
          <div className="space-y-6">
            {adminGroups.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Administrás
                </p>
                <AnimatedGroupList>
                  {adminGroups.map((group) => (
                    <AnimatedGroupItem key={group.id}>
                      <GroupCard group={group} isAdmin userId={userId} />
                    </AnimatedGroupItem>
                  ))}
                </AnimatedGroupList>
              </section>
            )}

            {participantGroups.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Participás
                </p>
                <AnimatedGroupList>
                  {participantGroups.map((group) => (
                    <AnimatedGroupItem key={group.id}>
                      <GroupCard group={group} isAdmin={false} userId={userId} />
                    </AnimatedGroupItem>
                  ))}
                </AnimatedGroupList>
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
              <p className="text-base font-semibold text-foreground">
                No tenés grupos todavía
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Creá uno o unite con un link de invitación
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <JoinViaLinkButton variant="outline" />
              <Button asChild className="gap-2">
                <Link href="/grupos/crear">
                  <Plus className="size-4" />
                  Crear mi primer grupo
                </Link>
              </Button>
            </div>

            {/* ── Introduccion breve ── */}
            <div className="mt-6 w-full max-w-sm border border-border rounded-2xl bg-card p-5 text-left space-y-4">
              <p className="text-sm font-semibold text-foreground text-center">
                ¿Qué es Zimbio?
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Share2 className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Compartí suscripciones</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Armá un grupo con amigos o familia para dividir el costo de Netflix, Spotify, Disney+ y más.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Calculamos todo automático</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Zimbio divide el costo con IVA incluido y te dice exactamente cuánto le toca pagar a cada uno.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Credenciales seguras</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Las contraseñas del servicio se guardan cifradas y solo los miembros del grupo pueden verlas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

    </div>
  );
}
