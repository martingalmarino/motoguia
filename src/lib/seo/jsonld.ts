import type { CollectionEntry } from 'astro:content';
import { site } from '../../config/site';
import { getBrand, motorcycleUrl } from '../content/catalog';
import { categoryLabel, displayName } from '../content/present';
import { hpToKw, isoDate } from '../format';
import { absoluteUrl } from './urls';

type Moto = CollectionEntry<'motorcycles'>;

const ORG_ID = `${site.origin}/#organization`;
const WEBSITE_ID = `${site.origin}/#website`;
export const LOGO_PATH = '/images/logo-512.png';

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    url: `${site.origin}/`,
    description: site.tagline,
    logo: { '@type': 'ImageObject', url: absoluteUrl(LOGO_PATH), width: 512, height: 512 },
    ...(site.contactEmail ? { email: site.contactEmail } : {}),
    areaServed: { '@type': 'Country', name: 'Argentina' },
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: `${site.origin}/`,
    inLanguage: 'es-AR',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.origin}/buscar/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: 'es-AR',
    author: { '@type': 'Organization', name: site.editorLabel, url: absoluteUrl('/sobre-nosotros/') },
    publisher: { '@id': ORG_ID },
    image: absoluteUrl(input.image ?? site.defaultOgImage),
    mainEntityOfPage: absoluteUrl(input.path),
    isPartOf: { '@id': WEBSITE_ID },
  };
}

export function itemListLd(name: string, elements: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: elements.length,
    itemListElement: elements.map((element, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: element.name,
      ...(element.path ? { url: absoluteUrl(element.path) } : {}),
    })),
  };
}

export function faqLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function collectionPageLd(input: { name: string; description: string; path: string; dateModified?: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: 'es-AR',
    isPartOf: { '@id': WEBSITE_ID },
    ...(input.dateModified ? { dateModified: isoDate(input.dateModified) } : {}),
  };
}

export function modelListingLd(input: {
  name: string;
  description: string;
  path: string;
  crumbs: { href: string; label: string }[];
  models: Moto[];
}) {
  const newest = input.models.map((entry) => entry.data.reviewedAt).sort((a, b) => b.getTime() - a.getTime())[0];
  return [
    collectionPageLd({ name: input.name, description: input.description, path: input.path, dateModified: newest }),
    breadcrumbLd(input.crumbs.map((item) => ({ name: item.label, path: item.href }))),
    itemListLd(
      input.name,
      input.models.map((entry) => ({ name: displayName(entry), path: motorcycleUrl(entry) })),
    ),
  ];
}

const quantity = (value: number | null | undefined, unitCode: string, unitText?: string) =>
  value === null || value === undefined ? undefined : { '@type': 'QuantitativeValue', value, unitCode, ...(unitText ? { unitText } : {}) };

const property = (name: string, value: string | number | boolean | null | undefined, unitText?: string) =>
  value === null || value === undefined || value === ''
    ? null
    : { '@type': 'PropertyValue', name, value: typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value, ...(unitText ? { unitText } : {}) };

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))) as T;
}

/** Producto y vehículo de una ficha. Solo incluye datos cargados; sin reseñas ni puntuaciones. */
export function motorcycleLd(entry: Moto, input: { path: string; images: string[] }) {
  const d = entry.data;
  const brand = getBrand(d.brandId);
  const url = absoluteUrl(input.path);
  const isElectric = d.engineType === 'electric';
  const engine = d.engine;
  const powerHp =
    engine?.declaredPowerOriginalUnit === 'hp' ? engine.declaredPowerOriginalValue : null;
  const powerKw = isElectric
    ? d.electric?.nominalPowerKw ?? null
    : engine?.declaredPowerOriginalUnit === 'kW'
      ? engine.declaredPowerOriginalValue
      : powerHp
        ? Number((engine?.powerKw ?? hpToKw(powerHp)).toFixed(2))
        : null;

  const vehicleEngine = compact({
    '@type': 'EngineSpecification',
    engineType: isElectric ? 'Eléctrico' : 'Combustión interna',
    fuelType: isElectric ? 'Electricidad' : 'Nafta',
    engineDisplacement: quantity(engine?.displacementCc, 'CMQ', 'cc'),
    enginePower: powerKw ? quantity(powerKw, 'KWT', 'kW') : undefined,
    torque: quantity(engine?.torqueNm, 'NU', 'Nm'),
  });

  const additionalProperty = [
    property('ABS', d.chassis?.abs),
    property('CBS (frenado combinado)', d.chassis?.cbs),
    property('Freno delantero', d.chassis?.brakesFront),
    property('Freno trasero', d.chassis?.brakesRear),
    property('Potencia declarada', powerHp, 'hp'),
    property('Refrigeración', engine?.cooling),
    property('Altura de asiento', d.dimensions?.seatHeightMm, 'mm'),
    property('Base del peso declarado', d.dimensions?.weightBasis),
    property('Tensión de la batería', d.electric?.voltageV, 'V'),
    property('Capacidad de la batería', d.electric?.capacityAh, 'Ah'),
    property('Energía de la batería', d.electric?.batteryKwh, 'kWh'),
    property('Química de la batería', d.electric?.batteryChemistry),
    property('Batería extraíble', d.electric?.removableBattery),
    property('Autonomía declarada', d.electric?.declaredRangeKm, 'km'),
    property('Tiempo de carga', d.electric?.chargingTimeHours, 'horas'),
    property('Garantía', d.warranty),
  ].filter(Boolean);

  const pricedVersions = d.versions.filter((version) => version.priceARS !== null);
  const offers = d.price
    ? compact({
        '@type': 'AggregateOffer',
        priceCurrency: 'ARS',
        lowPrice: d.price.minARS,
        highPrice: d.price.maxARS,
        offerCount: Math.max(pricedVersions.length, 1),
        url,
        availability:
          d.availability === 'available'
            ? 'https://schema.org/InStock'
            : d.availability === 'discontinued'
              ? 'https://schema.org/Discontinued'
              : undefined,
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'ARS',
          minPrice: d.price.minARS,
          maxPrice: d.price.maxARS,
          validFrom: isoDate(d.price.observedAt),
          description: `Precio de referencia observado el ${isoDate(d.price.observedAt)}.`,
        },
      })
    : undefined;

  return compact({
    '@context': 'https://schema.org',
    '@type': ['Product', 'Motorcycle'],
    '@id': `${url}#moto`,
    name: displayName(entry),
    url,
    description: d.editorial.summary,
    image: input.images.map((path) => absoluteUrl(path)),
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    manufacturer: brand ? { '@type': 'Organization', name: brand.name, ...(brand.website ? { url: brand.website } : {}) } : undefined,
    model: d.name,
    category: categoryLabel(d.category),
    bodyType: categoryLabel(d.category),
    vehicleConfiguration: d.specVersion ?? d.variant ?? undefined,
    countryOfAssembly: d.manufacturingCountry === 'AR' ? 'Argentina' : undefined,
    vehicleEngine,
    fuelType: isElectric ? 'Electricidad' : 'Nafta',
    vehicleTransmission: engine?.transmission ?? undefined,
    numberOfForwardGears: engine?.gears ?? undefined,
    weight: quantity(d.dimensions?.weightKg, 'KGM', 'kg'),
    fuelCapacity: isElectric ? undefined : quantity(d.fuel?.tankLiters, 'LTR', 'litros'),
    fuelConsumption: d.fuel?.consumptionL100km
      ? { '@type': 'QuantitativeValue', value: d.fuel.consumptionL100km, unitText: 'l/100 km' }
      : undefined,
    additionalProperty,
    offers,
  });
}

export function modelWebPageLd(entry: Moto, input: { path: string; title: string; description: string; image: string }) {
  const url = absoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: input.title,
    description: input.description,
    inLanguage: 'es-AR',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    datePublished: isoDate(entry.data.publishedAt),
    dateModified: isoDate(entry.data.reviewedAt),
    primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(input.image) },
    mainEntity: { '@id': `${url}#moto` },
  };
}
