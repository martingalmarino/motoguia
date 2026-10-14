# Despliegue

1. Node 22, `npm ci`.
2. Env de preview: `DEPLOYMENT_STAGE=preview`, `PUBLIC_INDEXING_ENABLED=false`, ads/analytics off.
3. Vercel: importar el repo, preset Astro, build `npm run build`, output `dist`. Sin adapter.
4. Dominio canónico en `SITE_URL`. Rebuild: el HTML es estático.
5. Verificar HTTPS, 404, `/robots.txt`, sitemap (vacío si noindex), fichas e imágenes.
6. Indexación recién cuando pasen los gates de `docs/LAUNCH_CHECKLIST.md`.
7. Rollback: redeploy del commit anterior.

Headers actuales: nosniff, referrer strict-origin-when-cross-origin, SAMEORIGIN. No hay CSP adivinada.

## Dominio de producción

Dominio canónico: `https://www.motoguia.com.ar`.

1. En Vercel (Project → Settings → Domains), agregar `www.motoguia.com.ar` y `motoguia.com.ar`.
2. En NIC.ar, cargar los registros que indique Vercel (CNAME de `www` y A del dominio raíz) o delegar los NS a Vercel.
3. Dejar `www.motoguia.com.ar` como dominio principal, con redirección 301 desde `motoguia.com.ar` (en el panel de Vercel). La de `motoguia.vercel.app` está en `vercel.json`.
4. Cuando `https://www.motoguia.com.ar` responda, configurar en Vercel (Production) y volver a desplegar:
   - `SITE_URL=https://www.motoguia.com.ar`
   - `PUBLIC_INDEXING_ENABLED=true`
   - `DEPLOYMENT_STAGE=production`
5. Verificar que las páginas no tengan `noindex`, que el canonical apunte a `www.motoguia.com.ar`, que `/sitemap-index.xml` responda 200 y que `/robots.txt` declare el sitemap.
6. Dar de alta el dominio en Google Search Console y Bing Webmaster Tools y enviar el sitemap.

No activar la indexación antes de que el dominio cargue: los canonical apuntarían a un dominio sin respuesta.
