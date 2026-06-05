"use client";

import { useActionState, useState, useMemo } from "react";
import { ShieldCheck, ArrowRight, Check, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceLogo } from "@/components/shared/service-logo";
import { cn } from "@/lib/utils";
import { calculateMonthlyTotal, formatARS, PAYMENT_METHODS } from "@/lib/tax-engine";
import {
  createGroupAction,
  type CreateGroupState,
} from "@/app/(app)/grupos/crear/actions";
import type { ServiceWithPlans } from "@/lib/services/service-plans";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CrearGrupoFormProps {
  services: ServiceWithPlans[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5", className)}>
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

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <p role="alert" className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function MemberStepper({
  count,
  min,
  max,
  onChange,
}: {
  count: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={count <= min}
        onClick={() => onChange(Math.max(min, count - 1))}
        className={cn(
          "flex items-center justify-center size-10 rounded-xl border border-border",
          "transition-all duration-150 active:scale-90",
          count <= min ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary",
        )}
      >
        <Minus className="size-4" />
      </button>
      <span className="text-3xl font-bold tabular-nums w-10 text-center" aria-live="polite">
        {count}
      </span>
      <button
        type="button"
        disabled={count >= max}
        onClick={() => onChange(Math.min(max, count + 1))}
        className={cn(
          "flex items-center justify-center size-10 rounded-xl border border-border",
          "transition-all duration-150 active:scale-90",
          count >= max ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary",
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const initialState: CreateGroupState = {};

export function CrearGrupoForm({ services }: CrearGrupoFormProps) {
  const [state, formAction, isPending] = useActionState(createGroupAction, initialState);

  // serviceId → planId seleccionado para ese servicio
  const [selectedPlansByService, setSelectedPlansByService] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta_pesificada" | "mercado_pago">(
    PAYMENT_METHODS.tarjeta_pesificada,
  );
  const [monthlyOverride, setMonthlyOverride] = useState<string>("");
  const [memberCount, setMemberCount] = useState<number>(2);

  const selectedServiceIds = Object.keys(selectedPlansByService);
  const selectedPlanIds = Object.values(selectedPlansByService).filter(Boolean);
  const allServicesHavePlan = selectedServiceIds.length > 0 &&
    selectedServiceIds.every((svcId) => !!selectedPlansByService[svcId]);

  // Planes seleccionados (con datos completos)
  const selectedPlans = useMemo(() => {
    return services.flatMap((svc) => {
      const planId = selectedPlansByService[svc.id];
      if (!planId) return [];
      const plan = svc.plans.find((p) => p.id === planId);
      return plan ? [{ ...plan, service: svc }] : [];
    });
  }, [services, selectedPlansByService]);

  // Límite de miembros = el mínimo de maxMembers entre todos los planes elegidos
  const maxMembersAllowed = allServicesHavePlan
    ? Math.min(...selectedPlans.map((p) => p.maxMembers))
    : 2;

  // Precio estimado = suma de todos los planes
  const estimatedTotal = useMemo(() => {
    if (!allServicesHavePlan) return null;
    return selectedPlans.reduce(
      (sum, plan) => sum + calculateMonthlyTotal(plan.basePriceArs, paymentMethod),
      0,
    );
  }, [selectedPlans, paymentMethod, allServicesHavePlan]);

  const finalTotal = monthlyOverride
    ? parseFloat(monthlyOverride) || 0
    : (estimatedTotal ?? 0);

  const sharePerPerson = allServicesHavePlan && finalTotal > 0
    ? Math.round(finalTotal / memberCount)
    : null;

  function handleServiceToggle(serviceId: string) {
    setSelectedPlansByService((prev) => {
      const next = { ...prev };
      if (next[serviceId] !== undefined) {
        delete next[serviceId]; // deseleccionar servicio
      } else {
        next[serviceId] = ""; // seleccionar servicio, sin plan aún
      }
      return next;
    });
    setMonthlyOverride("");
  }

  function handlePlanSelect(serviceId: string, planId: string) {
    setSelectedPlansByService((prev) => ({ ...prev, [serviceId]: planId }));
    setMonthlyOverride("");
  }

  // Cuando cambia el límite de miembros, ajustar el stepper si es necesario
  function handleMemberCountChange(count: number) {
    setMemberCount(Math.min(count, maxMembersAllowed));
  }

  // Si los planes cambiaron y el count quedó fuera de rango, corregirlo
  if (memberCount > maxMembersAllowed) {
    setMemberCount(maxMembersAllowed);
  }

  return (
    <form action={formAction} noValidate className="space-y-5">

      {/* ── 1. Servicios (multi-select) ── */}
      <SectionCard>
        <SectionTitle>Servicios</SectionTitle>
        <p className="text-xs text-muted-foreground -mt-2">
          Podés agregar uno o varios servicios al grupo
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {services.map((svc) => {
            const isSelected = svc.id in selectedPlansByService;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleServiceToggle(svc.id)}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium",
                  "transition-all duration-150 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "bg-primary/10 text-primary border-primary ring-1 ring-primary"
                    : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-secondary",
                )}
              >
                <ServiceLogo service={svc.type} className="size-6 rounded-md shrink-0" />
                <span className="truncate">{svc.name}</span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center size-4 rounded-full bg-primary">
                    <Check className="size-2.5 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <FieldError message={state.errors?.servicePlanIds?.[0]} />
      </SectionCard>

      {/* ── 2. Plan por servicio ── */}
      {selectedServiceIds.length > 0 && (
        <SectionCard>
          <SectionTitle>Plan por servicio</SectionTitle>
          <div className="space-y-6">
            {services
              .filter((svc) => svc.id in selectedPlansByService)
              .map((svc) => (
                <div key={svc.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ServiceLogo service={svc.type} className="size-5 rounded-md shrink-0" />
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                  </div>
                  <div className="space-y-2 pl-1">
                    {svc.plans.map((plan) => {
                      const isSelected = selectedPlansByService[svc.id] === plan.id;
                      const preview = calculateMonthlyTotal(plan.basePriceArs, paymentMethod);
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => handlePlanSelect(svc.id, plan.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm",
                            "transition-all duration-150 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isSelected
                              ? "bg-primary/10 border-primary ring-1 ring-primary"
                              : "bg-background border-border hover:border-primary/40 hover:bg-secondary",
                          )}
                        >
                          <div className="text-left">
                            <p className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>
                              {plan.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Hasta {plan.maxMembers} personas
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className={cn("font-semibold tabular-nums", isSelected ? "text-primary" : "text-foreground")}>
                              {formatARS(preview)}
                            </p>
                            <p className="text-xs text-muted-foreground">con IVA</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* ── 3. Cantidad de miembros ── */}
      {allServicesHavePlan && (
        <SectionCard>
          <SectionTitle>Miembros del grupo</SectionTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">¿Cuántos van a compartir?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Máximo {maxMembersAllowed} según los planes elegidos
              </p>
            </div>
            <MemberStepper
              count={memberCount}
              min={2}
              max={maxMembersAllowed}
              onChange={handleMemberCountChange}
            />
          </div>
          <FieldError message={state.errors?.maxMembers?.[0]} />
        </SectionCard>
      )}

      {/* ── 4. Método de pago + precio ── */}
      {allServicesHavePlan && (
        <SectionCard>
          <SectionTitle>Método de pago y precio</SectionTitle>

          <div className="grid grid-cols-2 gap-2">
            {(["tarjeta_pesificada", "mercado_pago"] as const).map((method) => {
              const labels = {
                tarjeta_pesificada: "Tarjeta pesificada",
                mercado_pago: "Mercado Pago",
              };
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method);
                    setMonthlyOverride("");
                  }}
                  className={cn(
                    "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                      : "bg-background border-border hover:bg-secondary text-foreground",
                  )}
                >
                  {labels[method]}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Total estimado ({selectedPlans.length} servicio{selectedPlans.length > 1 ? "s" : ""}) con IVA
              </p>
              <p className="text-2xl font-bold text-primary tabular-nums">
                {formatARS(estimatedTotal!)}
              </p>
              {sharePerPerson !== null && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatARS(sharePerPerson)} por persona · {memberCount} miembros
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monthly-override" className="text-xs text-muted-foreground">
                ¿Pagás diferente? Ingresá el monto real de tu resumen
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  id="monthly-override"
                  type="number"
                  inputMode="numeric"
                  placeholder={String(Math.round(estimatedTotal!))}
                  value={monthlyOverride}
                  onChange={(e) => setMonthlyOverride(e.target.value)}
                  className="pl-6"
                />
              </div>
            </div>

            {sharePerPerson !== null && (
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <p className="text-xs font-medium text-foreground">Cuota por persona</p>
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {formatARS(sharePerPerson)}/mes
                </p>
              </div>
            )}
          </div>

          <FieldError message={state.errors?.monthlyTotal?.[0]} />
        </SectionCard>
      )}

      {/* ── 5. Nombre + credenciales de cobro ── */}
      {allServicesHavePlan && (
        <SectionCard>
          <SectionTitle>Nombre y credenciales de cobro</SectionTitle>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre del grupo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej. Streaming con amigos"
              autoComplete="off"
              aria-invalid={!!state.errors?.name}
            />
            <FieldError message={state.errors?.name?.[0]} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alias">Alias de Mercado Pago</Label>
            <Input
              id="alias"
              name="alias"
              type="text"
              placeholder="tu.alias.mp"
              autoComplete="off"
              aria-invalid={!!state.errors?.alias}
            />
            <FieldError message={state.errors?.alias?.[0]} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cvu">CVU</Label>
            <Input
              id="cvu"
              name="cvu"
              type="text"
              placeholder="0000000000000000000000"
              inputMode="numeric"
              maxLength={22}
              autoComplete="off"
              aria-invalid={!!state.errors?.cvu}
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              Almacenado de forma segura
            </div>
            <FieldError message={state.errors?.cvu?.[0]} />
          </div>
        </SectionCard>
      )}

      {/* Campos ocultos */}
      {selectedPlanIds.map((planId) => (
        <input key={planId} type="hidden" name="servicePlanIds" value={planId} />
      ))}
      <input type="hidden" name="maxMembers" value={memberCount} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <input type="hidden" name="monthlyTotal" value={finalTotal} />

      {state.errors?._form && (
        <p role="alert" className="text-sm text-destructive text-center">
          {state.errors._form[0]}
        </p>
      )}

      {allServicesHavePlan && (
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="w-full gap-2 font-semibold"
        >
          {isPending ? (
            "Creando grupo..."
          ) : (
            <>
              Crear grupo
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      )}

      {!allServicesHavePlan && (
        <p className="text-center text-sm text-muted-foreground">
          {selectedServiceIds.length === 0
            ? "Seleccioná al menos un servicio para comenzar"
            : "Seleccioná un plan para cada servicio"}
        </p>
      )}
    </form>
  );
}
