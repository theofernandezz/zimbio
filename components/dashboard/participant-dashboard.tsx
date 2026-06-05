"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { CreditCard, Copy, Check, Receipt, Shield, Users, CheckCircle2, AlertCircle } from "lucide-react";

import { ServiceLogo } from "@/components/shared/service-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";
import { reportPaymentAction } from "@/app/(app)/dashboard/participante/actions";
import type { GroupDetail } from "@/lib/services/groups";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─── CopyField ────────────────────────────────────────────────────────────────

function CopyField({ label, value, truncate = false }: { label: string; value: string; truncate?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p
          className={cn("text-sm font-mono font-medium text-foreground", truncate && "truncate")}
          title={value}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copiado" : `Copiar ${label}`}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          copied
            ? "bg-emerald-100 text-emerald-700"
            : "bg-background border border-border text-foreground hover:bg-muted",
        )}
      >
        {copied
          ? <><Check className="size-3" />¡Copiado!</>
          : <><Copy className="size-3" />Copiar</>
        }
      </button>
    </div>
  );
}

// ─── Report payment button ────────────────────────────────────────────────────

function ReportPaymentButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="w-full border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/60 transition-all active:scale-[0.98]"
      aria-busy={pending}
    >
      {pending ? "Procesando..." : "Informar pago"}
    </Button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ParticipantDashboardProps {
  group: GroupDetail;
  myMemberId: string;
  myAmountDue: number;
  isPaid: boolean;
  userName: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ParticipantDashboard({
  group,
  myMemberId,
  myAmountDue,
  isPaid,
  userName,
}: ParticipantDashboardProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Welcome ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Hola, {firstName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {group.name} · {group.billingCycle}
              </p>
            </div>
          </div>
          <div className="self-start">
            {isPaid ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                <CheckCircle2 className="size-3" aria-hidden />
                Al día
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" aria-hidden />
                Pago pendiente
              </Badge>
            )}
          </div>
        </div>

        {/* ── Hero CTA ── */}
        <div
          className={cn(
            "rounded-2xl p-6 transition-colors duration-500",
            isPaid ? "bg-emerald-600" : "bg-primary",
          )}
          role="region"
          aria-label="Monto a pagar"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
            Tu cuota este mes
          </p>
          <p className={cn(
            "text-4xl font-bold text-white tabular-nums tracking-tight",
            isPaid && "line-through opacity-70",
          )}>
            {formatARS(myAmountDue)}
          </p>
          <p className="text-sm text-white/60 mt-1 mb-5">
            {group.servicePlans.map((sp) => sp.service.name).join(" + ")} — {group.billingCycle}
          </p>

          {isPaid ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3"
            >
              <Check className="size-4 text-white shrink-0" aria-hidden />
              <p className="text-sm text-white font-medium">
                Pago informado. El titular lo verificará.
              </p>
            </div>
          ) : (
            <form action={reportPaymentAction.bind(null, myMemberId, group.id)}>
              <ReportPaymentButton />
            </form>
          )}
        </div>

        {/* ── Tu grupo ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" aria-hidden />
              Tu grupo
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {group.members.length}/{group.maxMembers} miembros · {group.billingCycle}
            </p>
          </CardHeader>
          <CardContent>
            <ul role="list" className="divide-y divide-border">
              {group.members.map((member) => {
                const memberIsPaid = member.paymentStatus === "paid";
                const isMe = member.id === myMemberId;
                const isAdmin = member.userId === group.adminId;

                return (
                  <li key={member.id} className="flex items-center gap-3 py-2.5">
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                      style={{ backgroundColor: member.user.avatarColor }}
                      aria-hidden
                    >
                      {getInitials(member.user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {isMe ? "Vos" : member.user.name.split(" ")[0]}
                        </p>
                        {isAdmin && (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-secondary rounded px-1.5 py-0.5 shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-medium shrink-0",
                      memberIsPaid ? "text-emerald-600" : "text-muted-foreground",
                    )}>
                      {memberIsPaid ? "Al día ✓" : "Pendiente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* ── Datos de transferencia ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-muted-foreground" aria-hidden />
              Datos de transferencia
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transferí a {group.admin.name.split(" ")[0]} antes de que cierre el ciclo
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <CopyField label="Alias" value={group.alias} />
            <CopyField label="CVU" value={group.cvu} truncate />
          </CardContent>
        </Card>

        {/* ── Desglose de costos ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4 text-muted-foreground" aria-hidden />
              Desglose de costos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">Total mensual del grupo</dt>
                <dd className="font-medium tabular-nums">{formatARS(group.monthlyTotal)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">Miembros</dt>
                <dd className="font-medium">{group.maxMembers}</dd>
              </div>
            </dl>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tu cuota</p>
              <p className="text-base font-bold text-primary tabular-nums">
                {formatARS(myAmountDue)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total ingresado por el admin, incluye IVA 21%
            </p>
          </CardContent>
        </Card>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Shield className="size-3.5 text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">
            Administrado de forma segura por{" "}
            <span className="font-semibold text-primary">Zimbio</span>
          </p>
        </div>

      </div>
  );
}
