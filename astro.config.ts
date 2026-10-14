import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { indexingEnabled, siteOrigin } from './src/config/site';
import { isSitemapPath } from './src/lib/seo/sitemap';
import { buildSitemapMeta } from './src/lib/seo/sitemap-meta';

const sitemapMeta = buildSitemapMeta();

export default defineConfig({
  site: siteOrigin,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => indexingEnabled && isSitemapPath(new URL(page).pathname),
      serialize(item) {
        const next: Record<string, unknown> = { ...item };
        delete next.lastmod;
        const meta = sitemapMeta.get(new URL(item.url).pathname);
        if (meta) {
          next.lastmod = meta.lastmod;
          if (meta.images.length) next.img = meta.images.map((path) => ({ url: `${siteOrigin}${path}` }));
        }
        return next as typeof item;
      },
      namespaces: {
        news: false,
        xhtml: false,
        image: true,
        video: false,
      },
    }),
  ],
});
