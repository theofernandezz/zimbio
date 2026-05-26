"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MOCK_GROUPS } from "@/lib/mock-data";
import { formatARS, calculatePerPersonShare } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";
import {
  Shield,
  Check,
  Loader2,
  HelpCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

const INVITATION_STATE = {
  idle: "idle",
  accepting: "accepting",
  accepted: "accepted",
} as const;

type InvitationState =
  (typeof INVITATION_STATE)[keyof typeof INVITATION_STATE];

interface AcceptInvitationCardProps {
  token: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AcceptInvitationCard({ token: _token }: AcceptInvitationCardProps) {
  const router = useRouter();
  const [state, setState] = useState<InvitationState>(INVITATION_STATE.idle);

  // Mock: siempre muestra MOCK_GROUPS[0] independientemente del token
  const group = MOCK_GROUPS[0];
  const perPersonShare = calculatePerPersonShare(
    group.taxBreakdown.totalARS,
    group.members.length
  );

  async function handleAccept() {
    setState(INVITATION_STATE.accepting);

    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setState(INVITATION_STATE.accepted);

    setTimeout(() => {
      router.push("/dashboard/participante");
    }, 1500);
  }

  const isAccepting = state === INVITATION_STATE.accepting;
  const isAccepted = state === INVITATION_STATE.accepted;

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
            <span className="font-bold">{group.service.name}</span>
          </h1>
        </div>

        {/* Service sub-card */}
        <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
          {/* Service row */}
          <div className="flex items-center gap-2.5">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: group.service.brandColor }}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-foreground">
              {group.service.name}
            </span>
            <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
              {group.maxMembers} Pantallas / Plan familiar
            </span>
          </div>

          <Separator />

          {/* Amount */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tu cuota mensual
            </p>
            <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
              {formatARS(perPersonShare)}
            </p>
            <p className="text-xs text-muted-foreground">
              Mensual — Próximo cobro: {group.billingCycle}
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-muted/60 border border-border px-4 py-2 text-xs text-muted-foreground">
          <Shield className="size-3.5 shrink-0" aria-hidden="true" />
          Administrado de forma segura por{" "}
          <span className="font-semibold text-primary">Zimbio</span>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            disabled={isAccepting || isAccepted}
            className={cn(
              "w-full transition-all duration-300",
              isAccepted && "bg-emerald-600 hover:bg-emerald-600 text-white"
            )}
            aria-busy={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                Procesando...
              </>
            ) : isAccepted ? (
              <>
                <Check className="size-4 mr-2" aria-hidden="true" />
                ¡Te uniste al grupo!
              </>
            ) : (
              "Aceptar y unirme al grupo"
            )}
          </Button>

          {isAccepted && (
            <p
              role="status"
              aria-live="polite"
              className="text-center text-xs text-muted-foreground animate-pulse"
            >
              Redirigiendo a tu dashboard...
            </p>
          )}

          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-1 w-full text-xs text-muted-foreground",
              "hover:text-foreground transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
              (isAccepting || isAccepted) && "pointer-events-none opacity-40"
            )}
            disabled={isAccepting || isAccepted}
            aria-label="Ver cómo funciona Zimbio"
          >
            <HelpCircle className="size-3.5" aria-hidden="true" />
            ¿Cómo funciona?
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
