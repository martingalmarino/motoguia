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
3. Dejar `www.motoguia.com.ar` como dominio principal, con redirección 301 desde `motoguia.com.ar` y `motoguia.vercel.app` (Settings → Domains en Vercel; una regla por host en `vercel.json` no aplica sobre el dominio `.vercel.app`).
4. Cuando `https://www.motoguia.com.ar` responda, configurar en Vercel (Production) y volver a desplegar:
   - `SITE_URL=https://www.motoguia.com.ar`
   - `PUBLIC_INDEXING_ENABLED=true`
   - `DEPLOYMENT_STAGE=production`
5. Verificar que las páginas no tengan `noindex`, que el canonical apunte a `www.motoguia.com.ar`, que `/sitemap-index.xml` responda 200 y que `/robots.txt` declare el sitemap.
6. Dar de alta el dominio en Google Search Console y Bing Webmaster Tools y enviar el sitemap.

No activar la indexación antes de que el dominio cargue: los canonical apuntarían a un dominio sin respuesta.

## Actualización mensual

Dos procesos publican directo en `main`; cada push dispara el deploy de Vercel.

| Proceso | Cuándo | Qué actualiza |
| --- | --- | --- |
| GitHub Action `actualizacion-mensual.yml` | Día 5, 09:00 (Argentina) | Precios de Honda desde su sitio oficial |
| Automatización de Cursor "Actualización mensual MotoGuía" | Días 10 y 25, 09:00 (Argentina) | Ranking ACARA/SIOMAA y precios de otras marcas |

- Precios: `npm run prices` (o `npm run prices -- --dry-run` para ver el resultado sin escribir). Los modelos y sitios están en `src/data/price-sources.json`. Si una versión no coincide o el precio cambia más de 35%, ese modelo no se toca y queda anotado en el reporte.
- Ranking: el agente sigue `docs/automation/actualizacion-mensual.md`. Agrega `src/content/rankings/AAAA-MM.json` y `AAAA-ytd.json` (o `AAAA.json` al cerrar el año); las páginas `/motos-mas-vendidas/` y el año nuevo salen solos del contenido.
- Si un mes no hay datos nuevos, no se hace commit. `npm run build` tiene que pasar antes de publicar.
- Los precios con más de 90 días muestran el aviso "Precio de hace más de 3 meses" (`priceStaleDays` en `src/config/site.ts`); la validación avisa desde los 120 días.

Reportes:

- `reports/precios-AAAA-MM.json`: resultado del script de precios por modelo.
- `docs/actualizaciones/AAAA-MM.md`: resumen del agente (fuentes, cambios, lo que no se pudo verificar).

Pausar o correr a mano:

- GitHub Action: GitHub → Actions → "Precios Honda (mensual)" → "Disable workflow" (o `gh workflow disable actualizacion-mensual.yml`). Para correrla ya: "Run workflow" o `gh workflow run actualizacion-mensual.yml`.
- Automatización de Cursor: pausarla desde la lista de automatizaciones de Cursor.
- Para deshacer una actualización: `git revert` del commit y push.
