"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Pencil, Vault, KeyRound, Mail } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceLogo } from "@/components/shared/service-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllGroups } from "@/lib/hooks/use-all-groups";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useVaultEntry } from "@/lib/hooks/use-vault";
import type { Group } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value, className }: { value: string; className?: string }) {
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
        "flex items-center justify-center size-8 rounded-lg border border-border",
        "text-muted-foreground transition-all duration-150 active:scale-95 shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800"
          : "hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ─── Group vault card ─────────────────────────────────────────────────────────

function GroupVaultCard({ group, isAdmin }: { group: Group; isAdmin: boolean }) {
  const { entry, save } = useVaultEntry(group.id);
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPassword, setDraftPassword] = useState("");

  function startEditing() {
    setDraftEmail(entry?.email ?? "");
    setDraftPassword(entry?.password ?? "");
    setEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draftEmail.trim() || !draftPassword.trim()) return;
    save({ email: draftEmail.trim(), password: draftPassword.trim() });
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <ServiceLogo service={group.service.type} className="size-9 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
          <p className="text-xs text-muted-foreground">{group.service.name}</p>
        </div>
        {isAdmin && !editing && (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Editar credenciales"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium",
              "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Pencil className="size-3" />
            {entry ? "Editar" : "Agregar"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {editing ? (
          /* Edit form — admin only */
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`email-${group.id}`}>Email / Usuario</Label>
              <Input
                id={`email-${group.id}`}
                type="text"
                placeholder="usuario@ejemplo.com"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`pass-${group.id}`}>Contraseña</Label>
              <Input
                id={`pass-${group.id}`}
                type="text"
                placeholder="contraseña del servicio"
                value={draftPassword}
                onChange={(e) => setDraftPassword(e.target.value)}
                autoComplete="off"
                className="font-mono"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={!draftEmail.trim() || !draftPassword.trim()}
                className="flex-1"
              >
                Guardar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        ) : entry ? (
          /* Credentials view */
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2.5">
              <Mail className="size-3.5 text-muted-foreground shrink-0" />
              <p className="flex-1 min-w-0 text-sm font-mono text-foreground truncate">
                {entry.email}
              </p>
              <CopyButton value={entry.email} />
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2.5">
              <KeyRound className="size-3.5 text-muted-foreground shrink-0" />
              <p className="flex-1 min-w-0 text-sm font-mono text-foreground truncate select-none">
                {showPassword ? entry.password : "•".repeat(Math.min(entry.password.length, 16))}
              </p>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className={cn(
                  "flex items-center justify-center size-8 rounded-lg border border-border shrink-0",
                  "text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <CopyButton value={entry.password} />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
              <KeyRound className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Agregá las credenciales para que los participantes puedan acceder."
                : "El admin todavía no cargó las credenciales de este grupo."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const user = useCurrentUser();
  const allGroups = useAllGroups();

  if (!user) return null;

  const myGroups = allGroups.filter(
    (g) => g.admin.id === user.id || g.members.some((m) => m.user.id === user.id),
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vault</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Credenciales de acceso de tus suscripciones compartidas
          </p>
        </div>

        {myGroups.length > 0 ? (
          <div className="space-y-4">
            {myGroups.map((group) => (
              <GroupVaultCard
                key={group.id}
                group={group}
                isAdmin={group.admin.id === user.id}
              />
            ))}
          </div>
        ) : (
          /* Empty state — no groups yet */
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-secondary">
              <Vault className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Sin grupos todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cuando seas parte de un grupo, sus credenciales aparecerán acá.
              </p>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
