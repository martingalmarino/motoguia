export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function includesFolded(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return fold(haystack).includes(fold(needle));
}

export const arNumber = new Intl.NumberFormat('es-AR');
export const arCurrency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
export const arDecimal = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});
export const arDate = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

export function formatArs(value: number): string {
  return arCurrency.format(value);
}

export function formatInteger(value: number): string {
  return arNumber.format(value);
}

export function formatDate(value: Date | string): string {
  const iso = typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function isoDate(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/** Metric horsepower to kW. Argentine sheets usually label HP without a standard. */
export const METRIC_HP_TO_KW = 0.73549875;

export function hpToKw(hp: number): number {
  return hp * METRIC_HP_TO_KW;
}
