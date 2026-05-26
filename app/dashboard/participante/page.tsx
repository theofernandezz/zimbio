"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MOCK_GROUPS, MOCK_PAYMENTS } from "@/lib/mock-data";
import { formatARS } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Copy,
  Check,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Users,
} from "lucide-react";
import { PAYMENT_STATUS } from "@/lib/types";
import type { Group, GroupMember } from "@/lib/types";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

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
        <p className={cn("text-sm font-mono font-medium text-foreground", truncate && "truncate")} title={value}>
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        aria-label={copied ? "Copiado" : `Copiar ${label}`}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          copied
            ? "bg-emerald-100 text-emerald-700"
            : "bg-background border border-border text-foreground hover:bg-muted"
        )}
      >
        {copied ? <><Check className="size-3" />¡Copiado!</> : <><Copy className="size-3" />Copiar</>}
      </button>
    </div>
  );
}

// ─── Content (needs useSearchParams → inside Suspense) ───────────────────────

function ParticipantContent() {
  const searchParams = useSearchParams();
  const user = useCurrentUser();

  const groupId = searchParams.get("groupId") ?? MOCK_GROUPS[0].id;
  const group: Group = MOCK_GROUPS.find(g => g.id === groupId) ?? MOCK_GROUPS[0];
  const currentMember: GroupMember | undefined = group.members.find(m => m.user.id === user?.id);
  const userPayments = MOCK_PAYMENTS.filter(p => p.userId === user?.id && p.groupId === group.id);

  const [paymentReported, setPaymentReported] = useState(
    currentMember?.paymentStatus === PAYMENT_STATUS.Paid
  );

  // Wait for user to load from localStorage
  if (!user) return null;

  // Safety: user is in this group
  if (!currentMember) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-20 text-center text-muted-foreground text-sm">
          No sos miembro de este grupo.
        </div>
      </AppShell>
    );
  }

  const currentPaymentStatus = paymentReported ? PAYMENT_STATUS.Paid : currentMember.paymentStatus;
  const isPaid = currentPaymentStatus === PAYMENT_STATUS.Paid;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Welcome ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hola, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {group.name} · {group.billingCycle}
            </p>
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
            isPaid ? "bg-emerald-600" : "bg-primary"
          )}
          role="region"
          aria-label="Monto a pagar"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
            Tu cuota este mes
          </p>
          <p className={cn("text-4xl font-bold text-white tabular-nums tracking-tight", isPaid && "line-through opacity-70")}>
            {formatARS(currentMember.amountDue)}
          </p>
          <p className="text-sm text-white/60 mt-1 mb-5">
            {group.service.name} — {group.billingCycle}
          </p>

          {isPaid ? (
            <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
              <Check className="size-4 text-white shrink-0" aria-hidden />
              <p className="text-sm text-white font-medium">
                Pago informado. El titular lo verificará.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setPaymentReported(true)}
              variant="outline"
              className="w-full border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/60 transition-all active:scale-[0.98]"
            >
              Informar pago
            </Button>
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
              {group.members.length} miembros · {group.billingCycle}
            </p>
          </CardHeader>
          <CardContent>
            <ul role="list" className="divide-y divide-border">
              {group.members.map((member) => {
                const memberIsPaid = member.user.id === user.id
                  ? isPaid
                  : member.paymentStatus === PAYMENT_STATUS.Paid;
                const isYou = member.user.id === user.id;
                const isAdmin = member.user.id === group.admin.id;
                return (
                  <li key={member.user.id} className="flex items-center gap-3 py-2.5">
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                      style={{ backgroundColor: member.user.avatarColor }}
                      aria-hidden
                    >
                      {member.user.avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {isYou ? "Vos" : member.user.name.split(" ")[0]}
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
                      memberIsPaid ? "text-emerald-600" : "text-muted-foreground"
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

        {/* ── Desglose impositivo ── */}
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
                <dt className="text-muted-foreground">Precio base</dt>
                <dd className="font-medium tabular-nums">{formatARS(group.taxBreakdown.basePriceARS)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">IVA (21%)</dt>
                <dd className="font-medium tabular-nums">{formatARS(group.taxBreakdown.ivaAmount)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">PAIS (7.5%)</dt>
                <dd className="font-medium tabular-nums">{formatARS(group.taxBreakdown.paisAmount)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">Percepción AFIP (45%)</dt>
                <dd className="font-medium tabular-nums">{formatARS(group.taxBreakdown.percepcionAmount)}</dd>
              </div>
            </dl>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tu parte ({group.members.length} miembros)</p>
              <p className="text-base font-bold text-primary tabular-nums">{formatARS(currentMember.amountDue)}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Historial ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              Historial de pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userPayments.length > 0 ? (
              <ul className="space-y-2" role="list">
                {userPayments.slice(0, 4).map((payment) => (
                  <li key={payment.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3">
                    <div
                      className="size-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: group.service.brandColor }}
                      aria-hidden
                    >
                      {group.service.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payment.month}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatARS(payment.amountARS)}</p>
                    </div>
                    {payment.status === PAYMENT_STATUS.Paid ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0 gap-1">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Saldado
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0 gap-1">
                        <AlertCircle className="size-3" aria-hidden />
                        Pendiente
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin pagos registrados aún.
              </p>
            )}
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
    </AppShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParticipantDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ParticipantContent />
    </Suspense>
  );
}
