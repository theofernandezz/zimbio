"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import type { User } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function saveUser(user: User): void {
  localStorage.setItem("zimbio_user", JSON.stringify(user));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const user = useCurrentUser();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  // ── Profile save ────────────────────────────────────────────────────────────

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const updated: User = {
      ...user!,
      name: trimmed,
      avatarInitials: getInitials(trimmed),
    };
    saveUser(updated);
    setProfileMsg({ ok: true, text: "Nombre actualizado." });
    setTimeout(() => setProfileMsg(null), 3000);
  }

  // ── Password save ────────────────────────────────────────────────────────────

  function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();

    if (currentPassword !== user!.password) {
      setPasswordMsg({ ok: false, text: "La contraseña actual no es correcta." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }

    const updated: User = { ...user!, password: newPassword };
    saveUser(updated);
    setCurrentPassword("");
    setNewPassword("");
    setPasswordMsg({ ok: true, text: "Contraseña actualizada." });
    setTimeout(() => setPasswordMsg(null), 3000);
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  function handleLogout() {
    localStorage.removeItem("zimbio_user");
    router.push("/login");
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="max-w-lg mx-auto space-y-8">

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>

        {/* ── Profile ─────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Perfil
          </h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center size-14 rounded-full text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {getInitials(name || user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">El email no es editable</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileMsg(null); }}
                autoComplete="name"
              />
            </div>

            {profileMsg && (
              <p className={profileMsg.ok ? "text-xs text-emerald-600" : "text-xs text-destructive"}>
                {profileMsg.text}
              </p>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || name.trim() === user.name}
              className="gap-2"
            >
              <Save className="size-3.5" />
              Guardar nombre
            </Button>
          </form>
        </section>

        <Separator />

        {/* ── Password ─────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Contraseña
          </h2>

          <form onSubmit={handleSavePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordMsg(null); }}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                autoComplete="new-password"
              />
            </div>

            {passwordMsg && (
              <p className={passwordMsg.ok ? "text-xs text-emerald-600" : "text-xs text-destructive"}>
                {passwordMsg.text}
              </p>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!currentPassword || !newPassword}
              className="gap-2"
            >
              <Save className="size-3.5" />
              Cambiar contraseña
            </Button>
          </form>
        </section>

        <Separator />

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Sesión
          </h2>
          <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50">
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </section>

      </div>
    </AppShell>
  );
}
