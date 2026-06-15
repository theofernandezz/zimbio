"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, Pencil, KeyRound, Mail, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAccesosEntryAction, revealPasswordAction, type SaveAccesosState } from "@/app/(app)/accesos/actions";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccesosGroup {
  id: string;
  name: string;
  services: { type: string; name: string }[];
  isAdmin: boolean;
  vaults: { serviceType: string; email: string }[];
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : "Copiar"}
      className={cn(
        "flex items-center justify-center size-8 rounded-lg border border-border shrink-0",
        "text-muted-foreground transition-all duration-150 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
          : "hover:bg-secondary hover:text-foreground",
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ─── Service selector tabs ────────────────────────────────────────────────────

function ServiceTabs({
  services,
  selected,
  onChange,
}: {
  services: { type: string; name: string }[];
  selected: string;
  onChange: (type: string) => void;
}) {
  return (
    <div className="flex gap-1.5 px-5 pb-0 pt-3 border-b border-border">
      {services.map((svc) => (
        <button
          key={svc.type}
          type="button"
          onClick={() => onChange(svc.type)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors",
            selected === svc.type
              ? "border-primary text-foreground bg-muted/30"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20",
          )}
        >
          <ServiceLogo service={svc.type} className="size-4 rounded-[4px]" />
          {svc.name}
        </button>
      ))}
    </div>
  );
}

// ─── Credential body ──────────────────────────────────────────────────────────

function CredentialBody({
  group,
  selectedService,
  vault,
}: {
  group: AccesosGroup;
  selectedService: { type: string; name: string };
  vault: { serviceType: string; email: string } | undefined;
}) {
  const [editing, setEditing] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const boundAction = saveAccesosEntryAction.bind(null, group.id);
  const [state, formAction, savePending] = useActionState(boundAction, {} as SaveAccesosState);

  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  // Reset reveal state when switching services
  useEffect(() => {
    setRevealedPassword(null);
    setRevealError(null);
    setEditing(false);
  }, [selectedService.type]);

  function handleToggleReveal() {
    if (revealedPassword !== null) {
      setRevealedPassword(null);
      return;
    }
    setRevealError(null);
    startTransition(async () => {
      const result = await revealPasswordAction(group.id, selectedService.type);
      if (result.password) {
        setRevealedPassword(result.password);
      } else if (result.error) {
        setRevealError(result.error);
      }
    });
  }

  if (editing) {
    return (
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="serviceType" value={selectedService.type} />
        <div className="space-y-1.5">
          <Label htmlFor={`email-${group.id}-${selectedService.type}`}>Email / Usuario</Label>
          <Input
            id={`email-${group.id}-${selectedService.type}`}
            name="email"
            type="text"
            defaultValue={vault?.email ?? ""}
            placeholder="usuario@ejemplo.com"
            autoComplete="off"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`pass-${group.id}-${selectedService.type}`}>Contraseña del servicio</Label>
          <Input
            id={`pass-${group.id}-${selectedService.type}`}
            name="password"
            type="text"
            placeholder="contraseña del servicio"
            autoComplete="off"
            className="font-mono"
          />
        </div>
        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm" disabled={savePending} className="flex-1">
            {savePending ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  }

  if (vault) {
    return (
      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2.5">
          <Mail className="size-3.5 text-muted-foreground shrink-0" />
          <p className="flex-1 min-w-0 text-sm font-mono text-foreground truncate">
            {vault.email}
          </p>
          <CopyBtn value={vault.email} />
        </div>

        {/* Password — reveal on demand */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2.5">
          <KeyRound className="size-3.5 text-muted-foreground shrink-0" />
          <p className="flex-1 min-w-0 text-sm font-mono text-foreground truncate select-none">
            {revealedPassword !== null ? revealedPassword : "•".repeat(14)}
          </p>
          <button
            type="button"
            onClick={handleToggleReveal}
            disabled={isPending}
            aria-label={revealedPassword !== null ? "Ocultar contraseña" : "Mostrar contraseña"}
            className={cn(
              "flex items-center justify-center size-8 rounded-lg border border-border shrink-0",
              "text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isPending ? (
              <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : revealedPassword !== null ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </button>
          {revealedPassword !== null && <CopyBtn value={revealedPassword} />}
        </div>

        {revealError && (
          <p className="text-xs text-destructive">{revealError}</p>
        )}

        {group.isAdmin && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium",
                "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
              )}
            >
              <Pencil className="size-3" />
              Editar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (group.isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0 mt-0.5">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Credenciales pendientes
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Los participantes no pueden acceder hasta que cargues las credenciales de {selectedService.name}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
            "bg-amber-600 text-white hover:bg-amber-700 transition-colors active:scale-[0.98]",
          )}
        >
          <Pencil className="size-3.5" />
          Agregar credenciales
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
      <div className="flex items-center justify-center size-9 rounded-xl bg-secondary">
        <KeyRound className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        El admin todavía no cargó las credenciales de {selectedService.name}.
      </p>
    </div>
  );
}

// ─── Group accesos card ───────────────────────────────────────────────────────

function GroupAccesosCard({ group }: { group: AccesosGroup }) {
  const [selectedServiceType, setSelectedServiceType] = useState(group.services[0]?.type ?? "");
  const multiService = group.services.length > 1;

  const selectedService = group.services.find((s) => s.type === selectedServiceType) ?? group.services[0];
  const currentVault = group.vaults.find((v) => v.serviceType === selectedServiceType);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex -space-x-2 shrink-0">
          {group.services.map((svc) => (
            <ServiceLogo
              key={svc.type}
              service={svc.type}
              className="size-9 rounded-xl ring-2 ring-background"
            />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
          <p className="text-xs text-muted-foreground">
            {group.services.map((s) => s.name).join(" + ")}
          </p>
        </div>
      </div>

      {/* Service tabs — only for multi-service groups */}
      {multiService && (
        <ServiceTabs
          services={group.services}
          selected={selectedServiceType}
          onChange={setSelectedServiceType}
        />
      )}

      {/* Body */}
      <div className="px-5 py-4">
        <CredentialBody
          group={group}
          selectedService={selectedService ?? { type: "", name: "" }}
          vault={currentVault}
        />
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, groups }: { title: string; groups: AccesosGroup[] }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {title}
      </p>
      <div className="space-y-4">
        {groups.map((group) => (
          <GroupAccesosCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function AccesosClient({
  adminGroups,
  participantGroups,
}: {
  adminGroups: AccesosGroup[];
  participantGroups: AccesosGroup[];
}) {
  if (adminGroups.length === 0 && participantGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="flex items-center justify-center size-14 rounded-2xl bg-secondary">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Todavía no tenés grupos</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Creá un grupo o pedile a alguien que te invite. Los accesos aparecerán acá.
          </p>
        </div>
        <Link
          href="/grupos/crear"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Crear un grupo
        </Link>
      </div>
    );
  }

  const showSections = adminGroups.length > 0 && participantGroups.length > 0;

  if (showSections) {
    return (
      <div className="space-y-6">
        <Section title="Administrás" groups={adminGroups} />
        <Section title="Participás" groups={participantGroups} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...adminGroups, ...participantGroups].map((group) => (
        <GroupAccesosCard key={group.id} group={group} />
      ))}
    </div>
  );
}
