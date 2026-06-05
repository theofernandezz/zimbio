"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, Pencil, KeyRound, Mail, Lock } from "lucide-react";
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
  vault: { email: string } | null;
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

// ─── Group accesos card ───────────────────────────────────────────────────────

function GroupAccesosCard({ group }: { group: AccesosGroup }) {
  const [editing, setEditing] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const boundAction = saveAccesosEntryAction.bind(null, group.id);
  const [state, formAction, savePending] = useActionState(boundAction, {} as SaveAccesosState);

  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  function handleToggleReveal() {
    if (revealedPassword !== null) {
      setRevealedPassword(null);
      return;
    }
    setRevealError(null);
    startTransition(async () => {
      const result = await revealPasswordAction(group.id);
      if (result.password) {
        setRevealedPassword(result.password);
      } else if (result.error) {
        setRevealError(result.error);
      }
    });
  }

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
        {group.isAdmin && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium",
              "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
            )}
          >
            <Pencil className="size-3" />
            {group.vault ? "Editar" : "Agregar"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {editing ? (
          <form action={formAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`email-${group.id}`}>Email / Usuario</Label>
              <Input
                id={`email-${group.id}`}
                name="email"
                type="text"
                defaultValue={group.vault?.email ?? ""}
                placeholder="usuario@ejemplo.com"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`pass-${group.id}`}>Contraseña del servicio</Label>
              <Input
                id={`pass-${group.id}`}
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
        ) : group.vault ? (
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2.5">
              <Mail className="size-3.5 text-muted-foreground shrink-0" />
              <p className="flex-1 min-w-0 text-sm font-mono text-foreground truncate">
                {group.vault.email}
              </p>
              <CopyBtn value={group.vault.email} />
            </div>

            {/* Contraseña — reveal on demand */}
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
              <KeyRound className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {group.isAdmin
                ? "Agregá las credenciales para que los participantes puedan acceder."
                : "El admin todavía no cargó las credenciales de este grupo."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function AccesosClient({ groups }: { groups: AccesosGroup[] }) {
  if (groups.length === 0) {
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

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupAccesosCard key={group.id} group={group} />
      ))}
    </div>
  );
}
