"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Users, Copy, Check, CircleDollarSign, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAllGroups } from "@/lib/hooks/use-all-groups";
import { formatARS } from "@/lib/tax-engine";
import { PAYMENT_STATUS } from "@/lib/types";
import type { GroupMember } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── WhatsApp icon ────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Content (needs useSearchParams → inside Suspense) ───────────────────────

function AdminContent() {
  const searchParams = useSearchParams();
  const allGroups = useAllGroups();
  const groupId = searchParams.get("groupId");
  const group = allGroups.find(g => g.id === groupId) ?? allGroups[0];

  // Wait until groups are loaded from localStorage
  if (!group) return null;

  const [members, setMembers] = useState<GroupMember[]>(group.members.map(m => ({ ...m })));
  const [copiedLink, setCopiedLink] = useState(false);

  // ── Derived values ─────────────────────────────────────────────────────────

  const nonAdminMembers = members.slice(1);
  const paidCount = nonAdminMembers.filter(m => m.paymentStatus === PAYMENT_STATUS.Paid).length;
  const totalToCollect = nonAdminMembers.reduce((s, m) => s + m.amountDue, 0);
  const collectedSoFar = nonAdminMembers
    .filter(m => m.paymentStatus === PAYMENT_STATUS.Paid)
    .reduce((s, m) => s + m.amountDue, 0);
  const collectionPercent = totalToCollect > 0 ? Math.round((collectedSoFar / totalToCollect) * 100) : 0;
  const allPaid = paidCount === nonAdminMembers.length;

  const inviteUrl = group.inviteLink;
  const fullInviteUrl = `https://${group.inviteLink}`;

  // ── Handlers ───────────────────────────────────────────────────────────────

  function togglePaymentStatus(userId: string) {
    setMembers(prev =>
      prev.map(m => {
        if (m.user.id !== userId) return m;
        const next = m.paymentStatus === PAYMENT_STATUS.Paid
          ? PAYMENT_STATUS.Pending
          : PAYMENT_STATUS.Paid;
        return { ...m, paymentStatus: next };
      })
    );
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(fullInviteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function handleRemindWhatsApp(member: GroupMember) {
    const text = encodeURIComponent(
      `Hola ${member.user.name.split(" ")[0]}! 👋\n` +
      `Te recuerdo que tenés pendiente el pago de *${group.service.name}* de este mes en Zimbio.\n` +
      `Tu cuota: *${formatARS(member.amountDue)}*\n\n` +
      `Podés transferir a:\n` +
      `• Alias: ${group.alias}\n` +
      `• CVU: ${group.cvu}\n\n` +
      `¡Gracias! 🙏`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleShareInviteWhatsApp() {
    const text = encodeURIComponent(
      `Te invito a mi grupo de *${group.service.name}* en Zimbio 🎬\n` +
      `Entrá acá: ${fullInviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {group.services && group.services.length > 1 ? (
            <div className="flex -space-x-2.5 shrink-0">
              {group.services.slice(0, 3).map((svc, i) => (
                <ServiceLogo
                  key={svc.id}
                  service={svc.type}
                  className="size-11 rounded-xl ring-2 ring-background"
                  style={{ zIndex: group.services!.length - i }}
                />
              ))}
            </div>
          ) : (
            <ServiceLogo service={group.service.type} className="size-11 rounded-xl shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {group.name}
              </h1>
              <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">
                Admin
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ciclo: <span className="font-medium text-foreground">{group.billingCycle}</span>
            </p>
          </div>
        </div>

        {/* ── Status banner ────────────────────────────────────────────── */}
        <div
          className={cn(
            "rounded-2xl p-5 transition-colors duration-500",
            allPaid ? "bg-emerald-600" : "bg-primary"
          )}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Recaudación del ciclo
          </p>
          <div className="flex items-end justify-between mb-3">
            <p className="text-3xl font-bold text-white tabular-nums leading-none">
              {paidCount}
              <span className="text-base font-normal text-white/60 mx-1">de</span>
              {nonAdminMembers.length}
              <span className="text-base font-normal text-white/70 ml-2">pagaron</span>
            </p>
            <p className="text-sm font-bold text-white tabular-nums pb-0.5 text-right">
              {formatARS(collectedSoFar)}
              <span className="text-xs font-normal text-white/60 block">
                de {formatARS(totalToCollect)}
              </span>
            </p>
          </div>
          <Progress
            value={collectionPercent}
            className="h-2 bg-white/20 [&>div]:bg-white [&>div]:transition-all [&>div]:duration-500"
          />
          {allPaid && (
            <p className="text-sm text-white font-medium mt-3 flex items-center gap-1.5">
              <Check className="size-4 shrink-0" />
              ¡Todos pagaron este ciclo!
            </p>
          )}
          {!allPaid && nonAdminMembers.length - paidCount > 0 && (
            <p className="text-xs text-white/70 mt-2">
              {nonAdminMembers.length - paidCount} miembro{nonAdminMembers.length - paidCount > 1 ? "s" : ""} pendiente{nonAdminMembers.length - paidCount > 1 ? "s" : ""}
              {" · "}falta {formatARS(totalToCollect - collectedSoFar)} por cobrar
            </p>
          )}
        </div>

        {/* ── Members ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" aria-hidden />
              Miembros
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tocá el estado para marcarlo como pagado o pendiente
            </p>
          </CardHeader>
          <CardContent>
            <ul role="list" className="divide-y divide-border">
              {members.map((member) => {
                const isPaid = member.paymentStatus === PAYMENT_STATUS.Paid;
                const isAdmin = member.user.id === group.admin.id;
                return (
                  <li key={member.user.id} className="flex items-center gap-3 py-3">
                    {/* Avatar */}
                    <div
                      className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                      style={{ backgroundColor: member.user.avatarColor }}
                      aria-hidden
                    >
                      {member.user.avatarInitials}
                    </div>

                    {/* Name + amount */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.user.name}
                        </p>
                        {isAdmin && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
                            Vos
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatARS(member.amountDue)}
                      </p>
                    </div>

                    {/* Status badge — clickable for non-admin members */}
                    <button
                      type="button"
                      onClick={() => !isAdmin && togglePaymentStatus(member.user.id)}
                      disabled={isAdmin}
                      aria-label={
                        isAdmin ? undefined :
                        isPaid
                          ? `${member.user.name} pagó — click para marcar pendiente`
                          : `${member.user.name} pendiente — click para marcar pagado`
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shrink-0",
                        "transition-all duration-200",
                        !isAdmin && "cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80",
                        isAdmin && "cursor-default",
                        isPaid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                      )}
                    >
                      {isPaid
                        ? <Check className="size-3" aria-hidden />
                        : <Clock className="size-3" aria-hidden />
                      }
                      {isPaid ? "Pagó" : "Pendiente"}
                    </button>

                    {/* WhatsApp reminder — only for pending non-admin members */}
                    {!isPaid && !isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRemindWhatsApp(member)}
                        aria-label={`Recordarle a ${member.user.name} por WhatsApp`}
                        title="Enviar recordatorio por WhatsApp"
                        className={cn(
                          "flex items-center justify-center size-8 rounded-lg border border-border",
                          "text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5",
                          "transition-all duration-150 active:scale-95 shrink-0",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        )}
                      >
                        <WhatsAppIcon />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* ── Invite section ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invitar al grupo</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compartí el link para que alguien nuevo se una
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate border border-border select-all">
                {inviteUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copiedLink ? "Copiado" : "Copiar link"}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 px-3 py-2.5 rounded-lg border text-xs font-medium",
                  "transition-all duration-150 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  copiedLink
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-background border-border hover:bg-secondary text-foreground"
                )}
              >
                {copiedLink
                  ? <><Check className="size-3.5" /> Copiado</>
                  : <><Copy className="size-3.5" /> Copiar</>
                }
              </button>
            </div>
            <button
              type="button"
              onClick={handleShareInviteWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
              style={{ backgroundColor: "#25D366" }}
            >
              <WhatsAppIcon />
              Compartir por WhatsApp
            </button>
          </CardContent>
        </Card>

        {/* ── Financial summary ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleDollarSign className="size-4 text-muted-foreground" aria-hidden />
              Resumen de costos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Costo total mensual</span>
              <span className="font-semibold tabular-nums">{formatARS(group.taxBreakdown.totalARS)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cuota por persona</span>
              <span className="font-bold tabular-nums text-primary">{formatARS(members[0].amountDue)}</span>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Incluye IVA 21% + PAIS 7.5% + Percepción AFIP 45%
            </p>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminContent />
    </Suspense>
  );
}
