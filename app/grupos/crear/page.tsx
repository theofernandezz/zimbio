"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck, ArrowRight } from "lucide-react";

import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MOCK_SERVICES } from "@/lib/mock-data";
import { calculateTaxBreakdown } from "@/lib/tax-engine";
import type { SubscriptionService } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  service?: string;
  alias?: string;
  cvu?: string;
}

// ─── Service options ─────────────────────────────────────────────────────────

const SERVICE_OPTIONS: SubscriptionService[] = [
  MOCK_SERVICES.netflix,
  MOCK_SERVICES.spotify,
  MOCK_SERVICES.disney,
  MOCK_SERVICES.hbo,
  MOCK_SERVICES.youtube,
  MOCK_SERVICES.appleMusic,
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
      {children}
    </h2>
  );
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive mt-1">
      {message}
    </p>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CrearGrupoPage() {
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [selectedServices, setSelectedServices] = useState<SubscriptionService[]>([]);
  const [memberCount, setMemberCount] = useState(4);
  const [alias, setAlias] = useState("");
  const [cvu, setCvu] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!groupName.trim()) {
      next.name = "El nombre del grupo es obligatorio.";
    }
    if (selectedServices.length === 0) {
      next.service = "Seleccioná al menos un servicio.";
    }
    if (!alias.trim() || alias.trim().length < 6) {
      next.alias = "El alias debe tener al menos 6 caracteres.";
    }
    if (!/^\d{22}$/.test(cvu.trim())) {
      next.cvu = "El CVU debe tener exactamente 22 dígitos numéricos.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleToggleService(svc: SubscriptionService) {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === svc.id)
        ? prev.filter((s) => s.id !== svc.id)
        : [...prev, svc],
    );
    if (errors.service) setErrors((p) => ({ ...p, service: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Sum base prices of all selected services, then calculate combined tax breakdown
    const combinedBaseUSD = selectedServices.reduce((sum, s) => sum + s.basePriceUSD, 0);
    const breakdown = calculateTaxBreakdown(combinedBaseUSD);
    const perPerson = breakdown.totalARS / memberCount;

    // Use first service as the "primary" for display purposes
    const primaryService = selectedServices[0];

    const data = {
      groupName: groupName.trim(),
      service: primaryService,
      services: selectedServices,
      memberCount,
      alias: alias.trim(),
      cvu: cvu.trim(),
      taxBreakdown: breakdown,
      perPerson,
      inviteId: Math.random().toString(36).slice(2, 10),
    };

    sessionStorage.setItem("zimbio_group_created", JSON.stringify(data));
    router.push("/grupos/creado");
  }

  const MIN_MEMBERS = 2;
  const MAX_MEMBERS = 5;

  return (
    <OnboardingShell showBack backHref="/home">
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Crear grupo
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Configurá tu suscripción compartida en segundos.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* ── Sección 1: Información básica ── */}
          <SectionCard>
            <SectionTitle>Información básica</SectionTitle>

            {/* Nombre del grupo */}
            <div className="space-y-1.5">
              <Label htmlFor="group-name">Nombre del grupo</Label>
              <Input
                id="group-name"
                type="text"
                placeholder="Ej. Netflix con amigos"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "group-name-error" : undefined}
                autoComplete="off"
              />
              <FieldError id="group-name-error" message={errors.name} />
            </div>

            {/* Service selector — multi-select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-sm font-medium leading-none",
                    errors.service ? "text-destructive" : "text-foreground",
                  )}
                >
                  Servicios
                </p>
                {selectedServices.length > 0 && (
                  <span className="text-xs font-medium text-primary">
                    {selectedServices.length} seleccionado{selectedServices.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div
                role="group"
                aria-label="Seleccioná los servicios"
                aria-describedby={errors.service ? "service-error" : undefined}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {SERVICE_OPTIONS.map((svc) => {
                  const isSelected = selectedServices.some((s) => s.id === svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => handleToggleService(svc)}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium",
                        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "active:scale-95",
                        isSelected
                          ? "bg-primary/10 text-primary border-primary ring-1 ring-primary"
                          : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-secondary",
                      )}
                    >
                      <ServiceLogo service={svc.type} className="size-6 rounded-md shrink-0" />
                      <span className="truncate">{svc.name}</span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center size-4 rounded-full bg-primary">
                          <svg viewBox="0 0 10 10" className="size-2.5" fill="none" aria-hidden>
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <FieldError id="service-error" message={errors.service} />
            </div>

            {/* Group size stepper */}
            <div className="space-y-2">
              <p className="text-sm font-medium leading-none text-foreground">
                Participantes{" "}
                <span className="text-muted-foreground font-normal">
                  (máx. {MAX_MEMBERS})
                </span>
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Reducir participantes"
                  disabled={memberCount <= MIN_MEMBERS}
                  onClick={() =>
                    setMemberCount((n) => Math.max(MIN_MEMBERS, n - 1))
                  }
                  className={cn(
                    "flex items-center justify-center size-10 rounded-xl border border-border",
                    "transition-all duration-150 active:scale-90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    memberCount <= MIN_MEMBERS
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-secondary hover:border-primary/30",
                  )}
                >
                  <Minus className="size-4" />
                </button>

                <span
                  className="text-3xl font-bold tabular-nums text-foreground w-10 text-center"
                  aria-live="polite"
                  aria-label={`${memberCount} participantes`}
                >
                  {memberCount}
                </span>

                <button
                  type="button"
                  aria-label="Aumentar participantes"
                  disabled={memberCount >= MAX_MEMBERS}
                  onClick={() =>
                    setMemberCount((n) => Math.min(MAX_MEMBERS, n + 1))
                  }
                  className={cn(
                    "flex items-center justify-center size-10 rounded-xl border border-border",
                    "transition-all duration-150 active:scale-90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    memberCount >= MAX_MEMBERS
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-secondary hover:border-primary/30",
                  )}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ── Sección 2: Credenciales de cobro ── */}
          <SectionCard>
            <div>
              <SectionTitle>Credenciales de cobro</SectionTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tus datos de transferencia. Los participantes verán esta info
                para pagarte.
              </p>
            </div>

            {/* Alias */}
            <div className="space-y-1.5">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                type="text"
                placeholder="tu.alias.mp"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  if (errors.alias)
                    setErrors((p) => ({ ...p, alias: undefined }));
                }}
                aria-invalid={!!errors.alias}
                aria-describedby={errors.alias ? "alias-error" : undefined}
                autoComplete="off"
                inputMode="text"
              />
              <FieldError id="alias-error" message={errors.alias} />
            </div>

            {/* CVU */}
            <div className="space-y-1.5">
              <Label htmlFor="cvu">CVU</Label>
              <Input
                id="cvu"
                type="text"
                placeholder="0000000000000000000000"
                value={cvu}
                onChange={(e) => {
                  // Only allow digits, max 22
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 22);
                  setCvu(raw);
                  if (errors.cvu) setErrors((p) => ({ ...p, cvu: undefined }));
                }}
                aria-invalid={!!errors.cvu}
                aria-describedby={errors.cvu ? "cvu-error" : "cvu-hint"}
                inputMode="numeric"
                maxLength={22}
                autoComplete="off"
              />
              <FieldError id="cvu-error" message={errors.cvu} />
              {!errors.cvu && (
                <div
                  id="cvu-hint"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                  Almacenado de forma segura
                </div>
              )}
            </div>
          </SectionCard>

          {/* CTA */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2 font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            {isSubmitting ? (
              "Creando grupo..."
            ) : (
              <>
                Crear grupo
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </OnboardingShell>
  );
}
