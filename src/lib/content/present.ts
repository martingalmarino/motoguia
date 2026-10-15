import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { paths, site } from '../../config/site';
import { getAllBrands, getBrand, motorcycleUrl, type Brand } from './catalog';
import { formatArs, formatDate, formatInteger, hpToKw } from '../format';
import type { CollectionEntry } from 'astro:content';

type Moto = CollectionEntry<'motorcycles'>;

const CATEGORY_LABELS: Record<string, string> = {
  cub: 'Cub',
  street: 'Street',
  scooter: 'Scooter',
  trail: 'Trail',
  adventure: 'Adventure',
  sport: 'Sport',
  touring: 'Touring',
  other: 'Otra',
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  list: 'Precio de lista',
  promotional: 'Precio promocional',
  cash: 'Precio de contado',
  quoted: 'Precio cotizado',
};

export const NOT_INFORMED = 'No informado';

export function displayName(entry: Moto): string {
  const brand = getBrand(entry.data.brandId);
  return `${brand?.name ?? entry.data.brandId} ${entry.data.name}`;
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function engineLabel(type: string): string {
  return type === 'electric' ? 'Eléctrica' : 'Combustión';
}

export function isDealerPrice(entry: Moto): boolean {
  return entry.data.dataNotes?.some(note => note.startsWith('Precio de concesionario, no oficial')) ?? false;
}

export function priceTypeLabel(type: string, entry?: Moto): string {
  const baseLabel = PRICE_TYPE_LABELS[type] ?? 'Precio de referencia';
  if (entry && isDealerPrice(entry)) {
    const suffix = type === 'promotional' ? ' de concesionario (oferta)' : type === 'cash' ? ' de concesionario (contado)' : ' de concesionario';
    return baseLabel.replace(/^Precio /, 'Precio') + suffix.replace('Precio ', '');
  }
  return baseLabel;
}

function decimal(value: number): string {
  return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

export function shortSpec(entry: Moto): string {
  if (entry.data.engineType === 'electric') {
    const kw = entry.data.electric?.nominalPowerKw;
    return kw ? `${decimal(kw)} kW nominal` : 'Eléctrica';
  }
  const cc = entry.data.engine?.displacementCc;
  return cc ? `${decimal(cc)} cc` : 'Combustión';
}

/** Línea corta de tarjeta: "109 cc · Cub · Combustión". */
export function cardSpecLine(entry: Moto): string {
  const parts: string[] = [];
  if (entry.data.engineType === 'electric') {
    const kw = entry.data.electric?.nominalPowerKw;
    if (kw) parts.push(`${decimal(kw)} kW`);
  } else {
    const cc = entry.data.engine?.displacementCc;
    if (cc) parts.push(`${decimal(cc)} cc`);
  }
  parts.push(categoryLabel(entry.data.category), engineLabel(entry.data.engineType));
  return parts.join(' · ');
}

export function shortPrice(entry: Moto): string {
  const price = entry.data.price;
  if (!price) return 'Precio no disponible';
  return price.minARS === price.maxARS
    ? formatArs(price.minARS)
    : `${formatArs(price.minARS)} – ${formatArs(price.maxARS)}`;
}

export type PriceReference = {
  amount: string;
  prefix: string | null;
  rangeNote: string | null;
  typeLabel: string;
  date: string;
  dateIso: string;
  stale: boolean;
};

export const STALE_PRICE_NOTE = 'Precio de hace más de 3 meses: confirmalo en el concesionario.';

/** El precio se tomó hace más de `site.priceStaleDays` días, contados al momento del build. */
export function isPriceStale(entry: Moto, now = new Date()): boolean {
  const price = entry.data.price;
  if (!price) return false;
  return (now.valueOf() - price.observedAt.valueOf()) / 86_400_000 > site.priceStaleDays;
}

export function priceReference(entry: Moto): PriceReference | null {
  const price = entry.data.price;
  if (!price) return null;
  const isRange = price.minARS !== price.maxARS;
  return {
    amount: formatArs(price.minARS),
    prefix: isRange ? 'Desde' : null,
    rangeNote: isRange ? `Según versión, hasta ${formatArs(price.maxARS)}` : null,
    typeLabel: priceTypeLabel(price.priceType, entry),
    date: formatDate(price.observedAt),
    dateIso: price.observedAt.toISOString().slice(0, 10),
    stale: isPriceStale(entry),
  };
}

export function specValue(value: string | number | boolean | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === '') return NOT_INFORMED;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return unit ? `${formatInteger(value)} ${unit}` : decimal(value);
  return value;
}

export function powerLabel(entry: Moto): string {
  const engine = entry.data.engine;
  if (!engine?.declaredPowerOriginalValue || !engine.declaredPowerOriginalUnit) return NOT_INFORMED;
  if (engine.declaredPowerOriginalUnit === 'hp') {
    const kw = engine.powerKw ?? hpToKw(engine.declaredPowerOriginalValue);
    return `${decimal(engine.declaredPowerOriginalValue)} hp (${decimal(kw)} kW)`;
  }
  return `${decimal(engine.declaredPowerOriginalValue)} kW`;
}

export function registrationLabel(entry: Moto): string {
  const value = entry.data.price?.includesRegistration;
  if (value === null || value === undefined) return 'La fuente no aclara si incluye patentamiento.';
  return value ? 'Incluye patentamiento según la fuente.' : 'No incluye patentamiento según la fuente.';
}

export function priceLabel(entry: Moto): string {
  const price = entry.data.price;
  if (!price) return 'Precio no disponible';
  return `${shortPrice(entry)} · ${priceTypeLabel(price.priceType, entry)} al ${formatDate(price.observedAt)}. ${registrationLabel(entry)}`;
}

export type KeyFact = { label: string; value: string };

/** Hasta cuatro datos con valor; los faltantes se ven en la ficha técnica completa. */
export function keyFacts(entry: Moto): KeyFact[] {
  const d = entry.data;
  const facts: KeyFact[] = [];
  if (d.engineType === 'electric') {
    if (d.electric?.nominalPowerKw) facts.push({ label: 'Potencia nominal', value: `${decimal(d.electric.nominalPowerKw)} kW` });
    if (d.electric?.declaredRangeKm) facts.push({ label: 'Autonomía declarada', value: `${formatInteger(d.electric.declaredRangeKm)} km` });
    if (d.electric?.voltageV && d.electric.capacityAh)
      facts.push({ label: 'Batería', value: `${formatInteger(d.electric.voltageV)} V · ${formatInteger(d.electric.capacityAh)} Ah` });
    if (d.electric?.chargingTimeHours) facts.push({ label: 'Carga', value: d.electric.chargingTimeHours });
  } else {
    if (d.engine?.displacementCc) facts.push({ label: 'Cilindrada', value: `${decimal(d.engine.displacementCc)} cc` });
    if (d.engine?.declaredPowerOriginalValue) facts.push({ label: 'Potencia', value: powerLabel(entry) });
    if (d.engine?.transmission) facts.push({ label: 'Transmisión', value: d.engine.transmission });
    if (d.fuel?.tankLiters) facts.push({ label: 'Tanque', value: `${decimal(d.fuel.tankLiters)} l` });
  }
  if (d.dimensions?.weightKg) facts.push({ label: 'Peso', value: `${formatInteger(d.dimensions.weightKg)} kg` });
  if (d.dimensions?.seatHeightMm) facts.push({ label: 'Altura de asiento', value: `${formatInteger(d.dimensions.seatHeightMm)} mm` });
  return facts.slice(0, 4);
}

export type StageImage = { src: string; srcset: string | null; alt: string; credit: string; width: number; height: number };

const PUBLIC_DIR = join(process.cwd(), 'public');

export function stageImage(entry: Moto): StageImage {
  const photo = entry.data.images[0];
  const fallback = {
    src: photo?.path ?? '/images/silhouette.svg',
    srcset: null,
    alt: photo?.alt ?? `${displayName(entry)}, imagen de referencia`,
    credit: photo?.credit ?? '',
    width: 1200,
    height: 900,
  };
  if (!photo?.path) return fallback;
  const stem = photo.path.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');
  const small = `/images/motos/stage/${stem}-600.webp`;
  const large = `/images/motos/stage/${stem}-1200.webp`;
  if (!existsSync(join(PUBLIC_DIR, large))) return fallback;
  return { ...fallback, src: small, srcset: `${small} 600w, ${large} 1200w` };
}

export function brandModels(brand: Brand, entries: Moto[]) {
  return entries.filter((entry) => entry.data.brandId === brand.id);
}

export { paths, site, motorcycleUrl };

const brandNamesByUpper = new Map(getAllBrands().map((brand) => [brand.name.toUpperCase(), brand.name]));

export function reportModelLabel(reportName: string): string {
  const [first, ...rest] = reportName.split(' ');
  const brand = brandNamesByUpper.get(first);
  return brand ? `${brand} ${rest.join(' ')}` : reportName;
}

/** Los informes de ACARA nombran cada fila como "MARCA MODELO". */
export function reportModelParts(reportName: string): { brand: string; model: string } {
  const [first, ...rest] = reportName.split(' ');
  if (!rest.length) return { brand: '', model: reportName };
  return { brand: brandNamesByUpper.get(first) ?? first, model: rest.join(' ') };
}
