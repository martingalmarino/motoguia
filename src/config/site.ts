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
export const productionOriginFallback = 'https://www.motoguia.ar';

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
  defaultOgImage: '/images/og-default.svg',
  defaultOgImageAlt: 'MotoGuía AR, guía para elegir y comparar motos en Argentina',
  priceReviewDays: 30,
} as const;

export const paths = {
  home: '/',
  catalog: '/motos/',
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

export const navItems = [
  {
    label: 'Motos',
    href: paths.catalog,
    children: [
      { href: paths.catalog, label: 'Catálogo' },
      { href: paths.ranking, label: 'Más vendidas' },
      { href: paths.chinese, label: 'Motos chinas' },
      { href: paths.electric, label: 'Motos eléctricas' },
      { href: paths.brands, label: 'Marcas' },
    ],
  },
  {
    label: 'Comparativas',
    href: paths.comparisons,
    children: [
      { href: paths.comparisons, label: 'Comparativas editoriales' },
      { href: paths.comparator, label: 'Comparador' },
    ],
  },
  { label: 'Herramientas', href: paths.tools },
  { label: 'Guías', href: paths.guides },
  { label: 'Accesorios', href: paths.accessories },
] as const;

export const footerGroups = [
  {
    title: 'Motos',
    links: [
      { href: paths.catalog, label: 'Catálogo' },
      { href: paths.ranking2026, label: 'Ranking 2026' },
      { href: paths.chinese, label: 'Motos chinas' },
      { href: paths.electric, label: 'Motos eléctricas' },
      { href: paths.brands, label: 'Marcas' },
    ],
  },
  {
    title: 'Herramientas',
    links: [
      { href: paths.comparator, label: 'Comparador' },
      { href: paths.fuel, label: 'Calculadora de combustible' },
      { href: paths.monthlyCost, label: 'Costo mensual' },
      { href: paths.search, label: 'Buscar' },
    ],
  },
  {
    title: 'Editorial',
    links: [
      { href: paths.guides, label: 'Guías' },
      { href: paths.comparisons, label: 'Comparativas' },
      { href: paths.accessories, label: 'Accesorios' },
      { href: paths.methodology, label: 'Metodología' },
    ],
  },
  {
    title: 'Sitio',
    links: [
      { href: paths.about, label: 'Sobre nosotros' },
      { href: paths.contact, label: 'Contacto' },
      { href: paths.privacy, label: 'Privacidad' },
      { href: paths.cookies, label: 'Cookies' },
      { href: paths.legal, label: 'Aviso legal' },
      { href: paths.affiliates, label: 'Afiliados' },
    ],
  },
] as const;

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
