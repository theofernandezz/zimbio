import { notFound } from "next/navigation";
import Link from "next/link";
import { Copy, Users, LayoutDashboard } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getGroupById } from "@/lib/services/groups";
import { formatARS } from "@/lib/tax-engine";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/grupos/copy-button";
import { CreadoAnimatedWrapper, CreadoAnimatedCard } from "@/components/grupos/creado-animated-wrapper";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GrupoCreado({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { userId } = await requireAuth();
  const { id } = await searchParams;

  if (!id) notFound();

  const group = await getGroupById(id);
  if (!group || group.adminId !== userId) notFound();

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://zimbio.app"}/invitacion/${group.inviteToken}`;
  const sharePerPerson = Math.round(group.monthlyTotal / group.maxMembers);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <CreadoAnimatedWrapper>

        {/* ── 1. Header ── */}
        <CreadoAnimatedCard>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2 shrink-0">
                {group.servicePlans.map((sp) => (
                  <ServiceLogo
                    key={sp.id}
                    service={sp.service.type}
                    className="size-12 rounded-xl ring-2 ring-background"
                  />
                ))}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 mb-1">
                  ✓ Creado
                </span>
                <h1 className="text-lg font-bold text-foreground">{group.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">{group.maxMembers}</span> lugares · esperando participantes
              </span>
            </div>
          </div>
        </CreadoAnimatedCard>

        {/* ── 2. Resumen de costos ── */}
        <CreadoAnimatedCard>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Resumen de costos</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {group.servicePlans.map((sp) => sp.name).join(" + ")} · {group.billingCycle}
              </p>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total mensual (con IVA)</span>
                <span className="font-semibold tabular-nums">{formatARS(group.monthlyTotal)}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-primary/8 border border-primary/20 -mx-1">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cuota por persona</p>
                  <p className="text-xs text-muted-foreground">
                    {formatARS(group.monthlyTotal)} ÷ {group.maxMembers}
                  </p>
                </div>
                <span className="text-xl font-bold tabular-nums text-primary">
                  {formatARS(sharePerPerson)}
                  <span className="text-xs font-normal text-muted-foreground">/mes</span>
                </span>
              </div>
            </div>
          </div>
        </CreadoAnimatedCard>

        {/* ── 3. Link de invitación ── */}
        <CreadoAnimatedCard>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Invitar participantes</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compartí este link — cada persona lo usa para unirse
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate border border-border">
                {inviteUrl}
              </div>
              <CopyButton text={inviteUrl} />
            </div>
          </div>
        </CreadoAnimatedCard>

        {/* ── 4. Acciones ── */}
        <CreadoAnimatedCard>
          <div className="flex flex-col gap-3 pb-4">
            <Button asChild size="lg" className="w-full gap-2">
              <Link href={`/dashboard/admin?groupId=${group.id}`}>
                <LayoutDashboard className="size-4" />
                Ir al dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/grupos">Ver mis grupos</Link>
            </Button>
          </div>
        </CreadoAnimatedCard>

      </CreadoAnimatedWrapper>
    </div>
  );
}
