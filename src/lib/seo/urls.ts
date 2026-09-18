import { site } from '../../config/site';

export function absoluteUrl(path: string, origin = site.origin): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function formatPageTitle(title: string, includeBrand = true): string {
  if (!includeBrand || title.includes(site.name)) return title;
  return `${title} | ${site.name}`;
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
