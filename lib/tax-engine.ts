import type { TaxBreakdown } from "./types";

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Argentine digital services tax rates (2024).
 * Applied on the ARS-converted base price.
 *
 * IVA:        21%  — Impuesto al Valor Agregado
 * PAIS:       7.5% — Impuesto PAIS (post-reducción septiembre 2024)
 * Percepción: 45%  — Percepción AFIP sobre compras digitales en el exterior
 *
 * Effective rate: ~73.5% over the base price.
 */
export const TAX_RATES = {
  IVA: 0.21,
  PAIS: 0.075,
  PERCEPCION: 0.45,
} as const;

/**
 * Mock USD → ARS exchange rate.
 * In production: fetch from dolarapi.com or similar.
 */
export const MOCK_USD_TO_ARS = 1250;

// ─── Core functions ──────────────────────────────────────────────────────────

/**
 * Calculates the full ARS cost breakdown for a USD-priced digital subscription.
 *
 * @param basePriceUSD  - Subscription price in USD (e.g. 7.20 for Netflix Standard)
 * @param exchangeRate  - ARS per 1 USD (defaults to mock rate)
 * @returns TaxBreakdown with all line items and totals
 */
export function calculateTaxBreakdown(
  basePriceUSD: number,
  exchangeRate: number = MOCK_USD_TO_ARS,
): TaxBreakdown {
  const basePriceARS = basePriceUSD * exchangeRate;
  const ivaAmount = basePriceARS * TAX_RATES.IVA;
  const paisAmount = basePriceARS * TAX_RATES.PAIS;
  const percepcionAmount = basePriceARS * TAX_RATES.PERCEPCION;
  const totalARS = basePriceARS + ivaAmount + paisAmount + percepcionAmount;
  const effectiveTaxRate = (totalARS - basePriceARS) / basePriceARS;

  return {
    basePriceARS,
    ivaAmount,
    paisAmount,
    percepcionAmount,
    totalARS,
    effectiveTaxRate,
  };
}

/**
 * Splits the total ARS cost equally among all group members.
 */
export function calculatePerPersonShare(
  totalARS: number,
  memberCount: number,
): number {
  if (memberCount <= 0) throw new Error("memberCount must be at least 1");
  return totalARS / memberCount;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * Formats a number as Argentine Pesos (ARS), e.g. "$15.613,27".
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a percentage as a string, e.g. "73.5%".
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
