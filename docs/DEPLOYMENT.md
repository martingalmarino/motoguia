# Despliegue

1. Node 22, `npm ci`.
2. Env de preview: `DEPLOYMENT_STAGE=preview`, `PUBLIC_INDEXING_ENABLED=false`, ads/analytics off.
3. Vercel: importar el repo, preset Astro, build `npm run build`, output `dist`. Sin adapter.
4. Dominio canónico en `SITE_URL`. Rebuild: el HTML es estático.
5. Verificar HTTPS, 404, `/robots.txt`, sitemap (vacío si noindex), fichas e imágenes.
6. Indexación recién cuando pasen los gates de `docs/LAUNCH_CHECKLIST.md`.
7. Rollback: redeploy del commit anterior.

Headers actuales: nosniff, referrer strict-origin-when-cross-origin, SAMEORIGIN. No hay CSP adivinada.
