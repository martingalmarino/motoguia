# Mapa SEO

| Ruta | Intención | Indexable |
| --- | --- | --- |
| `/` | Portal: elegir y calcular costo | sí, si hay gates |
| `/motos/` | Catálogo | sí |
| `/motos/[marca]/[modelo]/` | Ficha / precio / specs | sí (publicadas) |
| `/motos-mas-vendidas/2026/` | Ranking 2026 | sí |
| `/motos-chinas/` | Motos chinas Argentina | sí |
| `/motos-electricas/` | Motos eléctricas Argentina | sí |
| `/comparativas/[slug]/` | A vs B | sí |
| `/comparador/` | Herramienta libre | noindex, follow |
| `/buscar/` | Búsqueda | noindex, follow |
| `/herramientas/calculadora-combustible/` | Gasto nafta | sí, con texto |
| `/guias/[slug]/` | Guías | sí |

Canonical: `SITE_URL`. Previews `noindex`. Sitemap sin lastmod inventado ni rutas noindex. 404 real, sin SPA fallback.
