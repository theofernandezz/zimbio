"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitacionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
      <div className="p-3 rounded-full bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Algo salió mal</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          No se pudo procesar la invitación. Intentá de nuevo o pedile al admin un nuevo link.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Reintentar
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/home">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
