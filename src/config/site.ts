function stripSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function envValue(key: keyof ImportMetaEnv): string | undefined {
  const fromImport = readEnv(import.meta.env[key]);
  if (fromImport) return fromImport;
  if (typeof process !== 'undefined') {
    return readEnv(process.env[key]);
  }
  return undefined;
}

export const PLACEHOLDER_ORIGINS = new Set([
  'https://www.motoguia.ar',
  'https://motoguia.ar',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

export const configuredSiteUrl = envValue('SITE_URL');
export const productionOriginFallback = 'https://www.motoguia.com.ar';

export const siteOrigin = stripSlash(
  configuredSiteUrl ?? productionOriginFallback,
);

export const deploymentStage = (envValue('DEPLOYMENT_STAGE') ??
  (envValue('VERCEL_ENV') === 'production'
    ? 'production'
    : envValue('VERCEL_ENV') === 'preview'
      ? 'preview'
      : 'development')) as 'development' | 'preview' | 'production';

const vercelEnv = envValue('VERCEL_ENV');
const indexingFlag = envValue('PUBLIC_INDEXING_ENABLED') === 'true';
const originLooksPlaceholder =
  PLACEHOLDER_ORIGINS.has(siteOrigin) ||
  siteOrigin.includes('localhost') ||
  siteOrigin.includes('127.0.0.1');

export const indexingEnabled =
  indexingFlag &&
  deploymentStage === 'production' &&
  vercelEnv !== 'preview' &&
  !originLooksPlaceholder;

export const contactEmail = envValue('PUBLIC_CONTACT_EMAIL') ?? null;

export const ads = {
  enabled:
    envValue('PUBLIC_ENABLE_ADS') === 'true' &&
    Boolean(envValue('PUBLIC_ADSENSE_CLIENT')) &&
    Boolean(envValue('PUBLIC_ADSENSE_SLOT_ARTICLE')),
  client: envValue('PUBLIC_ADSENSE_CLIENT') ?? null,
  slotArticle: envValue('PUBLIC_ADSENSE_SLOT_ARTICLE') ?? null,
  slotSidebar: envValue('PUBLIC_ADSENSE_SLOT_SIDEBAR') ?? null,
  adsTxtLine: envValue('ADS_TXT_LINE') ?? null,
};

export const analytics = {
  enabled:
    envValue('PUBLIC_ENABLE_ANALYTICS') === 'true' &&
    Boolean(envValue('PUBLIC_GA_MEASUREMENT_ID')),
  measurementId: envValue('PUBLIC_GA_MEASUREMENT_ID') ?? null,
  consentProvider: envValue('PUBLIC_CONSENT_PROVIDER') ?? null,
};

export const site = {
  name: envValue('PUBLIC_SITE_NAME') ?? 'MotoGuía AR',
  tagline: 'Encontrá tu próxima moto y calculá cuánto cuesta tenerla.',
  origin: siteOrigin,
  locale: 'es-AR',
  language: 'es-AR',
  editorLabel: 'Redacción MotoGuía AR',
  indexingEnabled,
  deploymentStage,
  contactEmail,
  googleSiteVerification:
    envValue('PUBLIC_GOOGLE_SITE_VERIFICATION') ?? 'SQoTmZlSdJ4aZeZoHGEdTKJORX9Eai4AdOG19by9k_8',
  defaultOgImage: '/images/og-default.png',
  defaultOgImageAlt: 'MotoGuía AR, guía para elegir y comparar motos en Argentina',
  priceReviewDays: 30,
} as const;

export const paths = {
  home: '/',
  catalog: '/motos/',
  prices: '/motos/precios/',
  brands: '/marcas/',
  ranking: '/motos-mas-vendidas/',
  ranking2026: '/motos-mas-vendidas/2026/',
  chinese: '/motos-chinas/',
  electric: '/motos-electricas/',
  comparator: '/comparador/',
  comparisons: '/comparativas/',
  tools: '/herramientas/',
  fuel: '/herramientas/calculadora-combustible/',
  monthlyCost: '/herramientas/costo-mensual-moto/',
  guides: '/guias/',
  accessories: '/accesorios/',
  search: '/buscar/',
  about: '/sobre-nosotros/',
  methodology: '/metodologia/',
  contact: '/contacto/',
  privacy: '/politica-de-privacidad/',
  cookies: '/politica-de-cookies/',
  legal: '/aviso-legal/',
  affiliates: '/afiliados/',
} as const;

export type NavLink = { href: string; label: string };
export type NavItem = NavLink & { children?: NavLink[] };

export const navItems: NavItem[] = [
  {
    label: 'Motos',
    href: paths.catalog,
    children: [
      { href: paths.catalog, label: 'Catálogo' },
      { href: paths.prices, label: 'Precios' },
      { href: paths.ranking, label: 'Más vendidas' },
      { href: '/motos/tipo/cub/', label: 'Cub' },
      { href: '/motos/tipo/scooter/', label: 'Scooters' },
      { href: '/motos/150cc/', label: 'Motos 150 cc' },
      { href: paths.electric, label: 'Motos eléctricas' },
      { href: paths.chinese, label: 'Motos chinas' },
    ],
  },
  { label: 'Marcas', href: paths.brands },
  { label: 'Comparativas', href: paths.comparisons },
  { label: 'Herramientas', href: paths.tools },
  {
    label: 'Guías',
    href: paths.guides,
    children: [
      { href: paths.guides, label: 'Guías de compra' },
      { href: paths.accessories, label: 'Equipamiento y accesorios' },
    ],
  },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: 'Motos',
    links: [
      { href: paths.catalog, label: 'Catálogo' },
      { href: paths.prices, label: 'Precios' },
      { href: paths.brands, label: 'Marcas' },
      { href: paths.ranking2026, label: 'Más vendidas 2026' },
      { href: '/motos/110cc/', label: 'Motos 110 cc' },
      { href: '/motos/150cc/', label: 'Motos 150 cc' },
      { href: '/motos/tipo/trail/', label: 'Motos trail' },
      { href: paths.chinese, label: 'Motos chinas' },
      { href: paths.electric, label: 'Motos eléctricas' },
    ],
  },
  {
    title: 'Comparar y calcular',
    links: [
      { href: paths.comparator, label: 'Comparador' },
      { href: paths.comparisons, label: 'Comparativas' },
      { href: paths.fuel, label: 'Gasto en combustible' },
      { href: paths.monthlyCost, label: 'Costo mensual' },
    ],
  },
  {
    title: 'Guías y equipamiento',
    links: [
      { href: paths.guides, label: 'Guías de compra' },
      { href: paths.accessories, label: 'Accesorios' },
      { href: paths.search, label: 'Buscar en el sitio' },
    ],
  },
  {
    title: 'Información',
    links: [
      { href: paths.about, label: 'Sobre nosotros' },
      { href: paths.methodology, label: 'Metodología y fuentes' },
      { href: paths.contact, label: 'Contacto' },
      { href: paths.privacy, label: 'Privacidad' },
      { href: paths.cookies, label: 'Cookies' },
      { href: paths.legal, label: 'Aviso legal' },
      { href: paths.affiliates, label: 'Afiliados' },
    ],
  },
];

export function motorcyclePath(brandSlug: string, modelSlug: string): string {
  return `/motos/${brandSlug}/${modelSlug}/`;
}

export function brandPath(brandSlug: string): string {
  return `/marcas/${brandSlug}/`;
}

export function guidePath(slug: string): string {
  return `/guias/${slug}/`;
}

export function comparisonPath(slug: string): string {
  return `/comparativas/${slug}/`;
}

export function accessoryPath(slug: string): string {
  return `/accesorios/${slug}/`;
}
