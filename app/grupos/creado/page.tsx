"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Users, LayoutDashboard, Share2 } from "lucide-react";

import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatARS, calculateTaxBreakdown } from "@/lib/tax-engine";
import type { SubscriptionService, TaxBreakdown } from "@/lib/types";
import { buildAndSaveGroup } from "@/lib/user-groups";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroupCreatedData {
  groupName: string;
  service: SubscriptionService;
  services?: SubscriptionService[]; // all selected (may be multiple)
  memberCount: number;
  alias: string;
  cvu: string;
  taxBreakdown: TaxBreakdown;
  perPerson: number;
  inviteId: string;
}

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GrupoCreado() {
  const router = useRouter();
  const user = useCurrentUser();
  const [data, setData] = useState<GroupCreatedData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("zimbio_group_created");
    if (!raw) { router.replace("/grupos/crear"); return; }
    try {
      const parsed = JSON.parse(raw) as GroupCreatedData;
      setData(parsed);
      // Persist to localStorage so /grupos can show it
      if (user) {
        buildAndSaveGroup(parsed, user);
      }
    } catch {
      router.replace("/grupos/crear");
    }
  }, [router, user]);

  if (!data) return null;

  const services = data.services ?? [data.service];
  const inviteUrl = `zimbio.app/join/${data.inviteId}`;
  const fullInviteUrl = `https://zimbio.app/join/${data.inviteId}`;

  function handleCopy() {
    navigator.clipboard.writeText(fullInviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWhatsApp() {
    if (!data) return;
    const serviceNames = services.map((s) => s.name).join(" + ");
    const text = encodeURIComponent(
      `Te invito a mi grupo de ${serviceNames} en Zimbio 🎬\n` +
      `Tu cuota mensual: ${formatARS(data.perPerson)}\n` +
      `Entrá acá: ${fullInviteUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <OnboardingShell contentWidth="md">
      <div className="max-w-lg mx-auto w-full space-y-4 py-2">

        {/* ── 1. Header — qué se creó ─────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {/* Service logos row + check badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {services.map((svc, i) => (
                <ServiceLogo
                  key={svc.id}
                  service={svc.type}
                  className="size-12 rounded-xl ring-2 ring-card"
                  style={{ zIndex: services.length - i }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  <Check className="size-3" />
                  Creado
                </span>
              </div>
              <h1 className="text-lg font-bold text-foreground tracking-tight mt-0.5 truncate">
                {data.groupName}
              </h1>
            </div>
          </div>

          {/* Member count pill */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>
              <span className="font-semibold text-foreground">{data.memberCount}</span> participantes · todavía no se unieron
            </span>
          </div>
        </div>

        {/* ── 2. Desglose de precios ──────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Resumen de costos</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Con IVA 21% + PAIS 7.5% + Percepción AFIP 45%
            </p>
          </div>

          <div className="px-5 py-3 space-y-1">
            {/* Per-service rows */}
            {services.map((svc) => {
              const breakdown = calculateTaxBreakdown(svc.basePriceUSD);
              return (
                <div key={svc.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ServiceLogo service={svc.type} className="size-7 rounded-lg shrink-0" />
                    <span className="text-sm text-foreground truncate">{svc.name}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground shrink-0 ml-3">
                    {formatARS(breakdown.totalARS)}
                    <span className="text-xs text-muted-foreground font-normal">/mes</span>
                  </span>
                </div>
              );
            })}

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Total mensual</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatARS(data.taxBreakdown.totalARS)}
              </span>
            </div>

            {/* Per person — highlighted */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-primary/8 border border-primary/20 -mx-1">
              <div>
                <p className="text-sm font-semibold text-foreground">Cuota por persona</p>
                <p className="text-xs text-muted-foreground">
                  {data.taxBreakdown.totalARS > 0
                    ? `${formatARS(data.taxBreakdown.totalARS)} ÷ ${data.memberCount}`
                    : ""}
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums text-primary">
                {formatARS(data.perPerson)}
                <span className="text-xs font-normal text-muted-foreground">/mes</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. Link de invitación ───────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Invitar participantes</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compartí este link — cada persona lo usa para unirse
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate select-all border border-border">
              {inviteUrl}
            </div>
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
                ? <><Check className="size-3.5" /> ¡Copiado!</>
                : <><Copy className="size-3.5" /> Copiar</>
              }
            </button>
          </div>
        </div>

        {/* ── 4. Acciones ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-4">
          <button
            type="button"
            onClick={handleWhatsApp}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "text-white text-sm font-semibold",
              "transition-all duration-150 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]",
            )}
            style={{ backgroundColor: "#25D366" }}
          >
            <WhatsAppIcon />
            Compartir por WhatsApp
          </button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => router.push(`/dashboard/admin?groupId=grp_${data.inviteId}`)}
          >
            <LayoutDashboard className="size-4" />
            Ir al dashboard
          </Button>
        </div>

      </div>
    </OnboardingShell>
  );
}
