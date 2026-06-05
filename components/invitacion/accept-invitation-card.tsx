"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Shield, Check, Loader2, Users, LogIn, UserPlus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceLogo } from "@/components/shared/service-logo";
import { formatARS } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";
import { joinGroupAction } from "@/app/invitacion/[token]/actions";
import type { GroupDetail } from "@/lib/services/groups";

// ─── Submit button con estado de carga ────────────────────────────────────────

function JoinButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full transition-all duration-300",
        pending && "opacity-80",
      )}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
          Procesando...
        </>
      ) : (
        <>
          <Check className="size-4 mr-2" aria-hidden />
          Aceptar y unirme al grupo
        </>
      )}
    </Button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AcceptInvitationCardProps {
  group: GroupDetail;
  token: string;
  isLoggedIn: boolean;
  isMember: boolean;
  isFull: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AcceptInvitationCard({
  group,
  token,
  isLoggedIn,
  isMember,
  isFull,
}: AcceptInvitationCardProps) {
  const sharePerPerson = Math.round(
    group.monthlyTotal / group.maxMembers,
  );
  const invitePath = `/invitacion/${token}`;

  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardContent className="pt-8 pb-7 px-7 space-y-6">

        {/* Eyebrow */}
        <div className="space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ¡Hola! Estás invitado
          </p>
          <h1 className="text-xl font-semibold text-foreground leading-snug">
            <span className="font-bold">{group.admin.name}</span> te invitó a
            compartir{" "}
            <span className="font-bold">
              {group.servicePlans.map((sp) => sp.service.name).join(" + ")}
            </span>
          </h1>
        </div>

        {/* Service card */}
        <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {group.servicePlans.map((sp) => (
                <ServiceLogo
                  key={sp.id}
                  service={sp.service.type}
                  className="size-10 rounded-xl ring-2 ring-background"
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {group.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {group.servicePlans.map((sp) => sp.name).join(" + ")}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Users className="size-3" />
              {group.members.length}/{group.maxMembers}
            </span>
          </div>

          <Separator />

          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tu cuota mensual
            </p>
            <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
              {formatARS(sharePerPerson)}
            </p>
            <p className="text-xs text-muted-foreground">
              {group.billingCycle} · {group.billingCycle}
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-muted/60 border border-border px-4 py-2 text-xs text-muted-foreground">
          <Shield className="size-3.5 shrink-0" aria-hidden />
          Administrado de forma segura por{" "}
          <span className="font-semibold text-primary">Zimbio</span>
        </div>

        {/* CTA — varía según estado */}
        <div className="space-y-3">
          {isFull ? (
            <div className="rounded-lg bg-muted/60 border border-border px-4 py-3 text-center text-sm text-muted-foreground">
              Este grupo ya está completo
            </div>
          ) : isMember ? (
            <Button asChild className="w-full">
              <Link href={`/dashboard/participante?groupId=${group.id}`}>
                <Check className="size-4 mr-2" />
                Ya sos miembro — ir al dashboard
              </Link>
            </Button>
          ) : isLoggedIn ? (
            /* Usuario logueado → Server Action directo */
            <form action={joinGroupAction.bind(null, group.id)}>
              <JoinButton />
            </form>
          ) : (
            /* Usuario no logueado → login o registro */
            <div className="space-y-2">
              <Button asChild className="w-full gap-2">
                <Link href={`/register?redirect=${encodeURIComponent(invitePath)}`}>
                  <UserPlus className="size-4" />
                  Crear cuenta y unirme
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href={`/login?redirect=${encodeURIComponent(invitePath)}`}>
                  <LogIn className="size-4" />
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
