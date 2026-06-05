"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { Users, Copy, Check, CircleDollarSign, Clock, Pencil, RefreshCw } from "lucide-react";

import { ServiceLogo } from "@/components/shared/service-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";
import {
  togglePaymentAction,
  updateMonthlyTotalAction,
  resetBillingCycleAction,
  type UpdateTotalState,
  type ResetCycleState,
} from "@/app/(app)/dashboard/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { GroupDetail } from "@/lib/services/groups";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─── WhatsApp icon ────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Toggle payment button ────────────────────────────────────────────────────

function TogglePaymentButton({ isPaid, memberName }: { isPaid: boolean; memberName: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={
        isPaid
          ? `${memberName} pagó — click para marcar pendiente`
          : `${memberName} pendiente — click para marcar pagado`
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shrink-0",
        "transition-all duration-200 cursor-pointer active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
        isPaid
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      )}
    >
      {isPaid
        ? <Check className="size-3" aria-hidden />
        : <Clock className="size-3" aria-hidden />
      }
      {isPaid ? "Pagó" : "Pendiente"}
    </button>
  );
}

// ─── Copy invite link button ──────────────────────────────────────────────────

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : "Copiar link"}
      className={cn(
        "flex items-center gap-1.5 shrink-0 px-3 py-2.5 rounded-lg border text-xs font-medium",
        "transition-all duration-150 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-background border-border hover:bg-secondary text-foreground",
      )}
    >
      {copied
        ? <><Check className="size-3.5" /> Copiado</>
        : <><Copy className="size-3.5" /> Copiar</>
      }
    </button>
  );
}

// ─── New cycle button ─────────────────────────────────────────────────────────

function NewCycleButton({
  groupId,
  currentCycle,
  nextCycle,
  memberCount,
}: {
  groupId: string;
  currentCycle: string;
  nextCycle: string;
  memberCount: number;
}) {
  const boundAction = resetBillingCycleAction.bind(null, groupId);
  const [state, formAction, pending] = useActionState<ResetCycleState, FormData>(boundAction, {});

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
          )}
        >
          <RefreshCw className="size-3" />
          Nuevo ciclo
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Iniciar ciclo de {nextCycle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Esto va a:</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>
                    Marcar a los{" "}
                    <span className="font-semibold text-foreground">{memberCount} miembros</span>{" "}
                    como <span className="font-semibold text-amber-600">pendientes</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    Cambiar el ciclo de{" "}
                    <span className="font-semibold text-foreground">{currentCycle}</span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">{nextCycle}</span>
                  </span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground pt-1">
                Esta acción no se puede deshacer. Los pagos del ciclo anterior quedan registrados en el historial.
              </p>
              {state.error && (
                <p className="text-xs text-destructive">{state.error}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={formAction}>
            <AlertDialogAction
              type="submit"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin" />
                  Iniciando...
                </span>
              ) : (
                `Iniciar ${nextCycle}`
              )}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Edit price card ─────────────────────────────────────────────────────────

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-primary transition-opacity",
        "disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

function EditPriceCard({
  groupId,
  monthlyTotal,
  maxMembers,
}: {
  groupId: string;
  monthlyTotal: number;
  maxMembers: number;
}) {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState(String(monthlyTotal));

  const boundAction = updateMonthlyTotalAction.bind(null, groupId);
  const [state, formAction] = useActionState<UpdateTotalState, FormData>(boundAction, {});

  const previewShare = rawValue
    ? Math.round((parseFloat(rawValue) || 0) / maxMembers)
    : Math.round(monthlyTotal / maxMembers);

  function handleSuccess(e: React.FormEvent<HTMLFormElement>) {
    if (state.success) setEditing(false);
    // success is checked after action resolves — handled via useEffect below
    void e;
  }

  // Cerrar modo edición cuando la acción fue exitosa
  if (state.success && editing) {
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CircleDollarSign className="size-4 text-muted-foreground" aria-hidden />
            Resumen de costos
          </CardTitle>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setRawValue(String(monthlyTotal));
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="size-3" />
              Actualizar
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          <form action={formAction} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="monthlyTotal" className="text-xs font-medium text-foreground">
                Total mensual (con IVA)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  id="monthlyTotal"
                  name="monthlyTotal"
                  type="number"
                  inputMode="numeric"
                  value={rawValue}
                  onChange={(e) => setRawValue(e.target.value)}
                  className={cn(
                    "w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-background text-sm font-mono",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    state.error && "border-destructive focus:ring-destructive",
                  )}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Verificá el monto en tu resumen de tarjeta o en{" "}
                <a
                  href="https://www.impuestito.org/suscripciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  impuestito.org
                </a>
              </p>
              {state.error && (
                <p className="text-xs text-destructive">{state.error}</p>
              )}
            </div>

            {/* Preview de cuota */}
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary text-sm">
              <span className="text-muted-foreground">Nueva cuota por persona</span>
              <span className="font-bold tabular-nums text-foreground">
                {formatARS(previewShare)}<span className="text-xs font-normal text-muted-foreground">/mes</span>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <SaveButton />
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total mensual (con IVA)</span>
              <span className="font-semibold tabular-nums">{formatARS(monthlyTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-primary/8 border border-primary/20 -mx-1">
              <div>
                <p className="text-sm font-semibold text-foreground">Cuota por persona</p>
                <p className="text-xs text-muted-foreground">
                  {formatARS(monthlyTotal)} ÷ {maxMembers}
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums text-primary">
                {formatARS(Math.round(monthlyTotal / maxMembers))}
                <span className="text-xs font-normal text-muted-foreground">/mes</span>
              </span>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Actualizá el total si el precio cambió en tu resumen de tarjeta.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  group: GroupDetail;
  inviteUrl: string;
  userId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function computeNextCycle(current: string): string {
  const [monthName, yearStr] = current.split(" ");
  const idx = MONTHS.indexOf(monthName as typeof MONTHS[number]);
  if (idx === -1) return current;
  const nextIdx = (idx + 1) % 12;
  const nextYear = nextIdx === 0 ? parseInt(yearStr, 10) + 1 : parseInt(yearStr, 10);
  return `${MONTHS[nextIdx]} ${nextYear}`;
}

export function AdminDashboard({ group, inviteUrl, userId }: AdminDashboardProps) {
  const nonAdminMembers = group.members.filter((m) => m.userId !== group.adminId);
  const paidCount = nonAdminMembers.filter((m) => m.paymentStatus === "paid").length;
  const totalToCollect = nonAdminMembers.reduce((s, m) => s + m.amountDue, 0);
  const collectedSoFar = nonAdminMembers
    .filter((m) => m.paymentStatus === "paid")
    .reduce((s, m) => s + m.amountDue, 0);
  const collectionPercent =
    totalToCollect > 0 ? Math.round((collectedSoFar / totalToCollect) * 100) : 0;
  const allPaid = nonAdminMembers.length > 0 && paidCount === nonAdminMembers.length;

  function handleWhatsAppReminder(memberName: string, amountDue: number) {
    const firstName = memberName.split(" ")[0];
    const serviceNames = group.servicePlans.map((sp) => sp.service.name).join(" + ");
    const text = encodeURIComponent(
      `Hola ${firstName}! 👋\n` +
      `Te recuerdo que tenés pendiente el pago de *${serviceNames}* de este mes en Zimbio.\n` +
      `Tu cuota: *${formatARS(amountDue)}*\n\n` +
      `Podés transferir a:\n` +
      `• Alias: ${group.alias}\n` +
      `• CVU: ${group.cvu}\n\n` +
      `¡Gracias! 🙏`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleShareInviteWhatsApp() {
    const serviceNames = group.servicePlans.map((sp) => sp.service.name).join(" + ");
    const text = encodeURIComponent(
      `Te invito a mi grupo de *${serviceNames}* en Zimbio 🎬\n` +
      `Entrá acá: ${inviteUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 shrink-0">
            {group.servicePlans.map((sp) => (
              <ServiceLogo
                key={sp.id}
                service={sp.service.type}
                className="size-11 rounded-xl ring-2 ring-background"
              />
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {group.name}
              </h1>
              <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Ciclo: <span className="font-medium text-foreground">{group.billingCycle}</span>
              </p>
              <NewCycleButton
                groupId={group.id}
                currentCycle={group.billingCycle}
                nextCycle={computeNextCycle(group.billingCycle)}
                memberCount={nonAdminMembers.length}
              />
            </div>
          </div>
        </div>

        {/* ── Status banner ── */}
        <div
          className={cn(
            "rounded-2xl p-5 transition-colors duration-500",
            allPaid ? "bg-emerald-600" : "bg-primary",
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
          {allPaid ? (
            <p className="text-sm text-white font-medium mt-3 flex items-center gap-1.5">
              <Check className="size-4 shrink-0" />
              ¡Todos pagaron este ciclo!
            </p>
          ) : nonAdminMembers.length - paidCount > 0 ? (
            <p className="text-xs text-white/70 mt-2">
              {nonAdminMembers.length - paidCount} miembro
              {nonAdminMembers.length - paidCount > 1 ? "s" : ""} pendiente
              {nonAdminMembers.length - paidCount > 1 ? "s" : ""}
              {" · "}falta {formatARS(totalToCollect - collectedSoFar)} por cobrar
            </p>
          ) : null}
        </div>

        {/* ── Members ── */}
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
              {group.members.map((member) => {
                const isPaid = member.paymentStatus === "paid";
                const isMe = member.userId === userId;
                const newStatus = isPaid ? "pending" : "paid";

                return (
                  <li key={member.id} className="flex items-center gap-3 py-3">
                    {/* Avatar */}
                    <div
                      className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                      style={{ backgroundColor: member.user.avatarColor }}
                      aria-hidden
                    >
                      {getInitials(member.user.name)}
                    </div>

                    {/* Name + amount */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.user.name}
                        </p>
                        {isMe && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
                            Vos
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatARS(member.amountDue)}
                      </p>
                    </div>

                    {/* Toggle payment — no se puede tocar al propio admin */}
                    {isMe ? (
                      <span className="text-xs text-muted-foreground shrink-0">Admin</span>
                    ) : (
                      <form action={togglePaymentAction.bind(null, member.id, group.id, newStatus)}>
                        <TogglePaymentButton isPaid={isPaid} memberName={member.user.name} />
                      </form>
                    )}

                    {/* WhatsApp reminder — solo miembros pendientes */}
                    {!isPaid && !isMe && (
                      <button
                        type="button"
                        onClick={() => handleWhatsAppReminder(member.user.name, member.amountDue)}
                        aria-label={`Recordarle a ${member.user.name} por WhatsApp`}
                        title="Enviar recordatorio por WhatsApp"
                        className={cn(
                          "flex items-center justify-center size-8 rounded-lg border border-border",
                          "text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5",
                          "transition-all duration-150 active:scale-95 shrink-0",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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

        {/* ── Invite section ── */}
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
              <CopyLinkButton url={inviteUrl} />
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

        {/* ── Financial summary ── */}
        <EditPriceCard
          groupId={group.id}
          monthlyTotal={group.monthlyTotal}
          maxMembers={group.maxMembers}
        />

      </div>
  );
}
