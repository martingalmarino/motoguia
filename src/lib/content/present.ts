import { paths, site } from '../../config/site';
import { getBrand, motorcycleUrl, type Brand } from './catalog';
import { formatArs, formatDate, formatInteger, hpToKw } from '../format';
import type { CollectionEntry } from 'astro:content';

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

export function displayName(entry: CollectionEntry<'motorcycles'>): string {
  const brand = getBrand(entry.data.brandId);
  return `${brand?.name ?? entry.data.brandId} ${entry.data.name}`;
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function engineLabel(type: string): string {
  return type === 'electric' ? 'Eléctrica' : 'Combustión';
}

export function shortSpec(entry: CollectionEntry<'motorcycles'>): string {
  if (entry.data.engineType === 'electric') {
    const kw = entry.data.electric?.nominalPowerKw;
    return kw ? `${kw} kW nominal` : 'Eléctrica';
  }
  const cc = entry.data.engine?.displacementCc;
  return cc ? `${cc} cm³` : 'Combustión';
}

export function shortPrice(entry: CollectionEntry<'motorcycles'>): string {
  const price = entry.data.price;
  if (!price) return 'Precio de lista no informado';
  return price.minARS === price.maxARS
    ? formatArs(price.minARS)
    : `${formatArs(price.minARS)} – ${formatArs(price.maxARS)}`;
}

export function specValue(value: string | number | boolean | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === '') return 'No informado por la fuente';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return unit ? `${formatInteger(value)} ${unit}` : String(value);
  return value;
}

export function powerLabel(entry: CollectionEntry<'motorcycles'>): string {
  const engine = entry.data.engine;
  if (!engine?.declaredPowerOriginalValue || !engine.declaredPowerOriginalUnit) {
    return 'No informado por la fuente';
  }
  if (engine.declaredPowerOriginalUnit === 'hp') {
    const kw = engine.powerKw ?? hpToKw(engine.declaredPowerOriginalValue);
    return `${engine.declaredPowerOriginalValue} hp (${kw.toLocaleString('es-AR', { maximumFractionDigits: 2 })} kW, conversión métrica)`;
  }
  return `${engine.declaredPowerOriginalValue} kW`;
}

export function priceLabel(entry: CollectionEntry<'motorcycles'>): string {
  const price = entry.data.price;
  if (!price) return 'Precio de lista no informado por la fuente';
  const range =
    price.minARS === price.maxARS
      ? formatArs(price.minARS)
      : `${formatArs(price.minARS)} – ${formatArs(price.maxARS)}`;
  const inclusion =
    price.includesRegistration === null
      ? 'No está aclarado si incluye patentamiento'
      : price.includesRegistration
        ? 'Incluye patentamiento según la fuente'
        : 'No incluye patentamiento según la fuente';
  return `${range} (${price.priceType}, observado ${formatDate(price.observedAt)}). ${inclusion}.`;
}

export function brandModels(brand: Brand, entries: CollectionEntry<'motorcycles'>[]) {
  return entries.filter((entry) => entry.data.brandId === brand.id);
}

export { paths, site, motorcycleUrl };
