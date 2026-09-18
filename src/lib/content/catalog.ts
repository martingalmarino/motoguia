import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import brandsData from '../../data/brands.json';
import sourcesData from '../../data/sources.json';

export type Brand = (typeof brandsData)[number];
export type Source = (typeof sourcesData)[number];

const brands = brandsData as Brand[];
const sources = sourcesData as Source[];

export async function getPublishedMotorcycles() {
  const entries = await getCollection('motorcycles', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => a.data.name.localeCompare(b.data.name, 'es'));
}

export async function getIndexableMotorcycles() {
  const entries = await getPublishedMotorcycles();
  return entries.filter((entry) => entry.data.indexable);
}

export async function getMotorcycle(id: string) {
  return getEntry('motorcycles', id);
}

export async function getPublishedGuides() {
  const entries = await getCollection('guides', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => b.data.reviewedAt.valueOf() - a.data.reviewedAt.valueOf());
}

export async function getPublishedComparisons() {
  const entries = await getCollection('comparisons', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => b.data.reviewedAt.valueOf() - a.data.reviewedAt.valueOf());
}

export async function getPublishedAccessoryGuides() {
  const entries = await getCollection('accessoryGuides', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => b.data.reviewedAt.valueOf() - a.data.reviewedAt.valueOf());
}

export async function getPublishedRankings() {
  return getCollection('rankings', ({ data }) => data.status === 'published');
}

export async function getRanking(id: string) {
  const rankings = await getPublishedRankings();
  return rankings.find((entry) => entry.data.id === id || entry.id === id);
}

export function getBrand(id: string): Brand | undefined {
  return brands.find((brand) => brand.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((brand) => brand.slug === slug);
}

export function getAllBrands(): Brand[] {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function getSource(id: string): Source | undefined {
  return sources.find((source) => source.id === id);
}

export function resolveSources(ids: string[]): Source[] {
  return ids
    .map((id) => getSource(id))
    .filter((source): source is Source => Boolean(source));
}

export function motorcycleUrl(entry: CollectionEntry<'motorcycles'>): string {
  const brand = getBrand(entry.data.brandId);
  if (!brand) throw new Error(`Missing brand ${entry.data.brandId} for ${entry.data.id}`);
  return `/motos/${brand.slug}/${entry.id}/`;
}

export async function relatedMotorcycles(entry: CollectionEntry<'motorcycles'>, limit = 3) {
  const published = await getPublishedMotorcycles();
  const byId = new Map(published.map((item) => [item.data.id, item]));
  const picked = entry.data.relatedModelIds
    .map((id) => byId.get(id))
    .filter((item): item is CollectionEntry<'motorcycles'> => Boolean(item));
  if (picked.length >= limit) return picked.slice(0, limit);
  const extras = published.filter(
    (item) =>
      item.data.id !== entry.data.id &&
      !picked.some((pick) => pick.data.id === item.data.id) &&
      (item.data.category === entry.data.category || item.data.brandId === entry.data.brandId),
  );
  return [...picked, ...extras].slice(0, limit);
}

export { render };
