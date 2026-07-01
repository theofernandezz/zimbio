const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function parseBillingCycle(cycle: string): { monthIndex: number; year: number } | null {
  const [monthName, yearStr] = cycle.split(" ");
  const monthIndex = MONTHS.indexOf(monthName as typeof MONTHS[number]);
  if (monthIndex === -1) return null;
  return { monthIndex, year: parseInt(yearStr, 10) };
}

export function nextBillingCycle(current: string): string {
  const parsed = parseBillingCycle(current);
  if (!parsed) {
    const now = new Date();
    return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
  const nextIdx = (parsed.monthIndex + 1) % 12;
  const nextYear = nextIdx === 0 ? parsed.year + 1 : parsed.year;
  return `${MONTHS[nextIdx]} ${nextYear}`;
}

// Último día del ciclo a las 23:59:59 hora local del servidor
export function endOfBillingCycle(cycle: string): Date | null {
  const parsed = parseBillingCycle(cycle);
  if (!parsed) return null;
  return new Date(parsed.year, parsed.monthIndex + 1, 0, 23, 59, 59);
}
