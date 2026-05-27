import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-5">
      <div className="flex items-center justify-center size-14 rounded-2xl bg-amber-500/10 mx-auto">
        <Construction className="size-7 text-amber-500" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          En construcción
        </h1>
        <p className="text-sm text-muted-foreground">
          La recuperación de contraseña estará disponible próximamente.
        </p>
      </div>

      <Button asChild variant="outline" className="gap-2">
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Volver al inicio de sesión
        </Link>
      </Button>
    </div>
  );
}
