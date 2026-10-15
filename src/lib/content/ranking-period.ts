const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export type RankingPeriod = {
  periodType: 'monthly' | 'yearToDate' | 'annual';
  periodStart: Date;
  periodEnd: Date;
};

const month = (date: Date) => MONTHS[date.getUTCMonth()];
const year = (date: Date) => date.getUTCFullYear();

/** "agosto 2026", "enero-agosto 2026" o "2026". */
export function periodLabel(period: RankingPeriod): string {
  const { periodType, periodStart, periodEnd } = period;
  if (periodType === 'monthly') return `${month(periodEnd)} ${year(periodEnd)}`;
  if (periodType === 'annual') return `${year(periodEnd)}`;
  if (periodStart.getUTCMonth() === periodEnd.getUTCMonth()) return `${month(periodEnd)} ${year(periodEnd)}`;
  return `${month(periodStart)}-${month(periodEnd)} ${year(periodEnd)}`;
}

/** "agosto de 2026", "de enero a agosto de 2026" o "de todo 2026", para usar dentro de una oración. */
export function periodPhrase(period: RankingPeriod): string {
  const { periodType, periodStart, periodEnd } = period;
  if (periodType === 'monthly') return `${month(periodEnd)} de ${year(periodEnd)}`;
  if (periodType === 'annual') return `de todo ${year(periodEnd)}`;
  if (periodStart.getUTCMonth() === periodEnd.getUTCMonth()) return `${month(periodEnd)} de ${year(periodEnd)}`;
  return `de ${month(periodStart)} a ${month(periodEnd)} de ${year(periodEnd)}`;
}

/** Versión corta: "ago 2026", "ene-ago 2026" o "2026". */
export function periodShortLabel(period: RankingPeriod): string {
  const short = (date: Date) => month(date).slice(0, 3);
  const { periodType, periodStart, periodEnd } = period;
  if (periodType === 'annual') return `${year(periodEnd)}`;
  if (periodType === 'monthly' || periodStart.getUTCMonth() === periodEnd.getUTCMonth()) {
    return `${short(periodEnd)} ${year(periodEnd)}`;
  }
  return `${short(periodStart)}-${short(periodEnd)} ${year(periodEnd)}`;
}

/** Nombre del mes final, por ejemplo "agosto". */
export function periodMonth(period: RankingPeriod): string {
  return month(period.periodEnd);
}

/** Elige el ranking con el período más reciente. */
export function latestByPeriodEnd<T extends { data: RankingPeriod }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => b.data.periodEnd.valueOf() - a.data.periodEnd.valueOf())[0];
}
