"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { logoutAction } from "@/app/actions/logout";
import { updateNameAction, updatePasswordAction, type UpdateNameState, type UpdatePasswordState } from "@/app/(app)/settings/actions";
import type { UserPublic } from "@/lib/services/users";

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export function SettingsForm({
  user,
  hasPassword,
}: {
  user: UserPublic;
  hasPassword: boolean;
}) {
  const [nameState, nameAction, namePending] = useActionState(updateNameAction, {} as UpdateNameState);
  const [pwState, pwAction, pwPending] = useActionState(updatePasswordAction, {} as UpdatePasswordState);

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>

      {/* ── Perfil ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Perfil
        </h2>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center size-14 rounded-full text-lg font-bold text-white shrink-0"
            style={{ backgroundColor: user.avatarColor }}
          >
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">El email no es editable</p>
          </div>
        </div>

        <form action={nameAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              autoComplete="name"
            />
          </div>
          {nameState.error && (
            <p className="text-xs text-destructive">{nameState.error}</p>
          )}
          {nameState.success && (
            <p className="text-xs text-emerald-600">Nombre actualizado.</p>
          )}
          <Button type="submit" size="sm" disabled={namePending} className="gap-2">
            <Save className="size-3.5" />
            {namePending ? "Guardando..." : "Guardar nombre"}
          </Button>
        </form>
      </section>

      <Separator />

      {/* ── Contraseña ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Contraseña
        </h2>

        {hasPassword ? (
          <form action={pwAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
              />
            </div>
            {pwState.error && (
              <p className="text-xs text-destructive">{pwState.error}</p>
            )}
            {pwState.success && (
              <p className="text-xs text-emerald-600">Contraseña actualizada.</p>
            )}
            <Button type="submit" size="sm" disabled={pwPending} className="gap-2">
              <Save className="size-3.5" />
              {pwPending ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tu cuenta está vinculada con Google — no tenés contraseña.
          </p>
        )}
      </section>

      <Separator />

      {/* ── Sesión ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Sesión
        </h2>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50"
          >
            Cerrar sesión
          </Button>
        </form>
      </section>
    </div>
  );
}
