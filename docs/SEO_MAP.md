# Mapa SEO

Dominio de producción: `https://www.motoguia.com.ar` (ver `docs/DEPLOYMENT.md` para activarlo).

| Ruta | Intención | Indexable | Datos estructurados |
| --- | --- | --- | --- |
| `/` | Portal: elegir y calcular costo | sí, si hay gates | Organization, WebSite |
| `/motos/` | Catálogo | sí | CollectionPage, BreadcrumbList, ItemList |
| `/motos/[marca]/[modelo]/` | Ficha / precio / specs | sí (publicadas) | WebPage, Product + Motorcycle, BreadcrumbList, FAQPage |
| `/motos/precios/` | Precios de motos en Argentina | sí | CollectionPage, ItemList, FAQPage |
| `/motos/110cc/`, `/motos/150cc/` | Motos por cilindrada | sí (3+ modelos) | CollectionPage, ItemList, FAQPage |
| `/motos/tipo/[tipo]/` | Cub, scooter, trail, calle | sí (3+ modelos) | CollectionPage, ItemList, FAQPage |
| `/marcas/[marca]/` | Modelos de una marca | sí | CollectionPage, ItemList, FAQPage |
| `/motos-mas-vendidas/2026/` | Ranking 2026 | sí | ItemList |
| `/motos-chinas/` | Motos chinas Argentina | sí | CollectionPage, BreadcrumbList, ItemList |
| `/motos-electricas/` | Motos eléctricas Argentina | sí | CollectionPage, BreadcrumbList, ItemList |
| `/comparativas/[slug]/` | A vs B | sí | Article |
| `/guias/[slug]/` | Guías | sí | Article |
| `/comparador/` | Herramienta libre | noindex, follow | — |
| `/buscar/` | Búsqueda | noindex, follow | — |
| `/herramientas/calculadora-combustible/` | Gasto nafta | sí, con texto | — |
| `/llms.txt` | Resumen del sitio para asistentes de IA | fuera del sitemap | — |
| `/datos/motos.json` | Fichas en JSON (datos abiertos) | fuera del sitemap | — |

## Reglas

- Canonical: `SITE_URL`. Previews `noindex`. 404 real, sin SPA fallback.
- Sitemap: `lastmod` sale de `reviewedAt` (fichas, guías, comparativas), de la ficha más nueva (listados y marcas) o de `verifiedAt` (rankings). Las rutas sin fecha propia no llevan `lastmod`. Las fichas incluyen su foto en `image:image`.
- `robots.txt` permite a los buscadores y a los bots de IA de búsqueda (OAI-SearchBot, PerplexityBot, Claude-SearchBot, etc.). Las páginas que no se indexan usan `noindex`, no `Disallow`.
- Títulos de fichas y comparativas: hasta 60 caracteres. Descripciones: entre 110 y 160. Los dos deben ser únicos; `npm run validate` lo controla.
- Imagen para redes: `public/images/og/{id}.jpg` por ficha (`npm run og` las regenera). El resto usa `og-default.png`.
- Preguntas frecuentes: se generan desde los datos de la ficha (`src/lib/content/faq.ts`, `hub-faq.ts`). Si la marca no informa un dato, la respuesta lo dice; no se completa con estimaciones.
- `Product` sin `review` ni `aggregateRating`: no publicamos opiniones de usuarios. `offers` solo si hay precio publicado.
