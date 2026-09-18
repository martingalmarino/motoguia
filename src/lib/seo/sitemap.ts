export const NOINDEX_PATH_PREFIXES = ['/buscar/', '/comparador/'] as const;

export function isSitemapPath(pathname: string): boolean {
  if (pathname.includes('404')) return false;
  return !NOINDEX_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}
