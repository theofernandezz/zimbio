"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : "Copiar link"}
      className={cn(
        "flex items-center gap-1.5 shrink-0 px-3 py-2.5 rounded-lg border text-xs font-medium",
        "transition-all duration-150 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-background border-border hover:bg-secondary text-foreground",
      )}
    >
      {copied ? (
        <><Check className="size-3.5" /> ¡Copiado!</>
      ) : (
        <><Copy className="size-3.5" /> Copiar</>
      )}
    </button>
  );
}
