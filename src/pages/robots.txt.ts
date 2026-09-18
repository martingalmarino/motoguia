import type { APIRoute } from 'astro';
import { indexingEnabled, site } from '../config/site';

export const GET: APIRoute = () => {
  const body = indexingEnabled
    ? `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap-index.xml\n`
    : `User-agent: *\nAllow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
