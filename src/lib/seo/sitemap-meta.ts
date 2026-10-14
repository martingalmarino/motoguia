import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import brands from '../../data/brands.json';

export type SitemapMeta = { lastmod: string; images: string[] };

const CONTENT_DIR = join(process.cwd(), 'src/content');

function field(text: string, name: string): string | undefined {
  return text.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1]?.trim();
}

function readCollection(dir: string) {
  return readdirSync(join(CONTENT_DIR, dir))
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ slug: file.replace(/\.md$/, ''), text: readFileSync(join(CONTENT_DIR, dir, file), 'utf8') }))
    .filter(({ text }) => field(text, 'status') === 'published');
}

function latest(dates: string[]): string | undefined {
  return dates.filter(Boolean).sort().at(-1);
}

/** Fechas de revisión reales por ruta, leídas del frontmatter. Las rutas sin fecha propia no llevan lastmod. */
export function buildSitemapMeta(): Map<string, SitemapMeta> {
  const meta = new Map<string, SitemapMeta>();
  const brandSlug = new Map(brands.map((brand) => [brand.id, brand.slug]));
  const brandDates = new Map<string, string[]>();
  const modelDates: string[] = [];

  for (const { slug, text } of readCollection('motorcycles')) {
    const reviewed = field(text, 'reviewedAt');
    const brandId = field(text, 'brandId');
    const bSlug = brandId ? brandSlug.get(brandId) : undefined;
    if (!reviewed || !bSlug) continue;
    const images = [...text.matchAll(/^\s+- path: (\/images\/motos\/\S+)$/gm)].map((match) => {
      const stem = match[1].replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');
      return `/images/motos/stage/${stem}-1200.webp`;
    });
    meta.set(`/motos/${bSlug}/${slug}/`, { lastmod: reviewed, images });
    modelDates.push(reviewed);
    brandDates.set(bSlug, [...(brandDates.get(bSlug) ?? []), reviewed]);
  }

  for (const [bSlug, dates] of brandDates) {
    meta.set(`/marcas/${bSlug}/`, { lastmod: latest(dates)!, images: [] });
  }

  const sections: [string, string][] = [
    ['guides', '/guias/'],
    ['comparisons', '/comparativas/'],
    ['accessory-guides', '/accesorios/'],
  ];
  for (const [dir, base] of sections) {
    const dates: string[] = [];
    for (const { slug, text } of readCollection(dir)) {
      const reviewed = field(text, 'reviewedAt');
      if (!reviewed) continue;
      meta.set(`${base}${slug}/`, { lastmod: reviewed, images: [] });
      dates.push(reviewed);
    }
    const newest = latest(dates);
    if (newest) meta.set(base, { lastmod: newest, images: [] });
  }

  const rankingDates = new Map<string, string[]>();
  for (const file of readdirSync(join(CONTENT_DIR, 'rankings')).filter((name) => name.endsWith('.json'))) {
    const ranking = JSON.parse(readFileSync(join(CONTENT_DIR, 'rankings', file), 'utf8'));
    if (ranking.status !== 'published' || !ranking.verifiedAt) continue;
    const yearPath = `/motos-mas-vendidas/${ranking.year}/`;
    rankingDates.set(yearPath, [...(rankingDates.get(yearPath) ?? []), ranking.verifiedAt]);
  }
  for (const [path, dates] of rankingDates) meta.set(path, { lastmod: latest(dates)!, images: [] });
  const newestRanking = latest([...rankingDates.values()].flat());
  if (newestRanking) meta.set('/motos-mas-vendidas/', { lastmod: newestRanking, images: [] });

  const newestModel = latest(modelDates);
  if (newestModel) {
    const listings = [
      '/',
      '/motos/',
      '/marcas/',
      '/motos-electricas/',
      '/motos-chinas/',
      '/motos/precios/',
      '/motos/110cc/',
      '/motos/150cc/',
      '/motos/tipo/cub/',
      '/motos/tipo/scooter/',
      '/motos/tipo/trail/',
      '/motos/tipo/calle/',
    ];
    for (const path of listings) {
      meta.set(path, { lastmod: newestModel, images: [] });
    }
  }
  return meta;
}
