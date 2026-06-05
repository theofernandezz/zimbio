"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, UserRound, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { registerAction, type RegisterState } from "@/app/(auth)/register/actions";

// ─── Password strength ────────────────────────────────────────────────────────

type StrengthLevel = "empty" | "weak" | "fair" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return "empty";
  if (password.length < 6) return "weak";
  const score = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
    password.length >= 10,
  ].filter(Boolean).length;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
  empty:  { label: "",        color: "bg-border",      bars: 0 },
  weak:   { label: "Débil",   color: "bg-destructive", bars: 1 },
  fair:   { label: "Regular", color: "bg-amber-400",   bars: 2 },
  strong: { label: "Segura",  color: "bg-emerald-500", bars: 3 },
};

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { label, color, bars } = STRENGTH_CONFIG[getPasswordStrength(password)];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i <= bars ? color : "bg-border")}
          />
        ))}
      </div>
      {label && <p className="text-xs text-muted-foreground">Contraseña <span className="font-medium">{label}</span></p>}
    </div>
  );
}

// ─── Google icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const initialState: RegisterState = {};

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Crear una cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Únete a Zimbio y gestioná tus suscripciones en grupo
        </p>
      </div>

      {/* Google OAuth */}
      <Button variant="outline" className="w-full gap-2 mb-4" asChild>
        <a href="/api/auth/google">
          <GoogleIcon />
          Registrarse con Google
        </a>
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <Separator className="flex-1" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          o registrate con email
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Form */}
      <form action={formAction} noValidate className="space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej. Juan Pérez"
              autoComplete="name"
              className="pl-9"
              aria-invalid={!!state.errors?.name}
            />
          </div>
          {state.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className="pl-9"
              aria-invalid={!!state.errors?.email}
            />
          </div>
          {state.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              aria-invalid={!!state.errors?.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
          {state.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Error general */}
        {state.errors?._form && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            {state.errors._form[0]}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
