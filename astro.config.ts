import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { indexingEnabled, siteOrigin } from './src/config/site';
import { isSitemapPath } from './src/lib/seo/sitemap';

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
        const next = { ...item };
        delete next.lastmod;
        return next;
      },
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
  ],
});
