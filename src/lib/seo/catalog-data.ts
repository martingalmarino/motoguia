import type { CollectionEntry } from 'astro:content';
import { getBrand, motorcycleUrl, resolveSources } from '../content/catalog';
import { categoryLabel, displayName, priceTypeLabel } from '../content/present';
import { isoDate } from '../format';
import { absoluteUrl } from './urls';

type Moto = CollectionEntry<'motorcycles'>;

/** Ficha en formato de datos abiertos: solo valores cargados, con fuentes y fechas. */
export function modelRecord(entry: Moto) {
  const d = entry.data;
  const brand = getBrand(d.brandId);
  return {
    id: d.id,
    name: displayName(entry),
    brand: brand?.name ?? d.brandId,
    model: d.name,
    variant: d.variant,
    url: absoluteUrl(motorcycleUrl(entry)),
    category: categoryLabel(d.category),
    engineType: d.engineType === 'electric' ? 'eléctrica' : 'combustión',
    summary: d.editorial.summary,
    engine:
      d.engineType === 'combustion'
        ? {
            displacementCc: d.engine?.displacementCc ?? null,
            declaredPower: d.engine?.declaredPowerOriginalValue
              ? { value: d.engine.declaredPowerOriginalValue, unit: d.engine.declaredPowerOriginalUnit }
              : null,
            transmission: d.engine?.transmission ?? null,
            gears: d.engine?.gears ?? null,
            cooling: d.engine?.cooling ?? null,
          }
        : null,
    electric:
      d.engineType === 'electric'
        ? {
            nominalPowerKw: d.electric?.nominalPowerKw ?? null,
            peakPowerKw: d.electric?.peakPowerKw ?? null,
            voltageV: d.electric?.voltageV ?? null,
            capacityAh: d.electric?.capacityAh ?? null,
            batteryKwh: d.electric?.batteryKwh ?? null,
            batteryChemistry: d.electric?.batteryChemistry ?? null,
            removableBattery: d.electric?.removableBattery ?? null,
            declaredRangeKm: d.electric?.declaredRangeKm ?? null,
            rangeConditions: d.electric?.rangeConditions ?? null,
            chargingTimeHours: d.electric?.chargingTimeHours ?? null,
          }
        : null,
    brakes: {
      front: d.chassis?.brakesFront ?? null,
      rear: d.chassis?.brakesRear ?? null,
      abs: d.chassis?.abs ?? null,
      cbs: d.chassis?.cbs ?? null,
    },
    dimensions: {
      weightKg: d.dimensions?.weightKg ?? null,
      weightBasis: d.dimensions?.weightBasis ?? null,
      seatHeightMm: d.dimensions?.seatHeightMm ?? null,
    },
    fuel:
      d.engineType === 'combustion'
        ? {
            tankLiters: d.fuel?.tankLiters ?? null,
            consumptionL100km: d.fuel?.consumptionL100km ?? null,
          }
        : null,
    specVersion: d.specVersion,
    versions: d.versions.map((version) => ({ name: version.name, priceARS: version.priceARS, note: version.note })),
    price: d.price
      ? {
          minARS: d.price.minARS,
          maxARS: d.price.maxARS,
          type: priceTypeLabel(d.price.priceType),
          observedAt: isoDate(d.price.observedAt),
          includesRegistration: d.price.includesRegistration,
        }
      : null,
    warranty: d.warranty,
    reviewedAt: isoDate(d.reviewedAt),
    sources: resolveSources(d.sourceIds).map((source) => ({ title: source.title, url: source.url, publisher: source.publisher })),
  };
}
