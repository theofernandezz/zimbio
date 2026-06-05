// ─── Impuestos vigentes en Argentina para servicios digitales (2024–) ─────────
//
// IVA:         21% — siempre aplica
// PAIS:        eliminado septiembre 2024 — ya no aplica
// Ganancias:   eliminado junto al PAIS en 2024 — ya no aplica
// IIBB:        varía por provincia (3–5%) — ignorado en MVP

export const TAX_RATES = {
  IVA: 0.21,
} as const;

export const PAYMENT_METHODS = {
  tarjeta_pesificada: "tarjeta_pesificada",
  mercado_pago: "mercado_pago",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

const PAYMENT_METHOD_MULTIPLIERS: Record<PaymentMethod, number> = {
  tarjeta_pesificada: 1 + TAX_RATES.IVA, // 1.21
  mercado_pago: 1 + TAX_RATES.IVA,       // 1.21
};

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Calcula el precio final en ARS aplicando IVA según el método de pago.
 * @param basePriceArs - Precio base del plan sin impuestos
 * @param paymentMethod - Método de pago seleccionado
 */
export function calculateMonthlyTotal(
  basePriceArs: number,
  paymentMethod: PaymentMethod,
): number {
  return Math.round(basePriceArs * PAYMENT_METHOD_MULTIPLIERS[paymentMethod]);
}

/**
 * Divide el total mensual entre los miembros del grupo.
 * @param monthlyTotal - Total con IVA en ARS
 * @param memberCount  - Cantidad de miembros (mínimo 2)
 */
export function calculateMemberShare(
  monthlyTotal: number,
  memberCount: number,
): number {
  if (memberCount < 2) throw new Error("Un grupo requiere al menos 2 miembros");
  return Math.round(monthlyTotal / memberCount);
}

// ─── Alias de compatibilidad — DEPRECATED ────────────────────────────────────
// TODO: eliminar cuando grupos/creado y grupos/crear sean reescritos con DB real

/** @deprecated Usar calculateMemberShare */
export const calculatePerPersonShare = calculateMemberShare;

/** @deprecated Los precios ya no son en USD. Usar calculateMonthlyTotal con basePriceArs. */
export function calculateTaxBreakdown(basePriceArs: number) {
  const totalARS = Math.round(basePriceArs * 1.21);
  return {
    basePriceARS: basePriceArs,
    ivaAmount: Math.round(basePriceArs * 0.21),
    paisAmount: 0,
    percepcionAmount: 0,
    totalARS,
    effectiveTaxRate: 0.21,
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Formatea un número como pesos argentinos: "$15.613".
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
