# Estado de implementación

- 2026-09-18: repo nuevo en `/Users/martingalmarino/Desktop/motoguia-ar`, separado de mapadeingresos.
- Astro 7 estático, schemas, catálogo, ranking ACARA ago-2026, 21 fichas publicadas, 5 comparativas, 6 guías, 3 accesorios, comparador, 2 calculadoras, SEO noindex por defecto.
- `npm run build` OK: 67 páginas, tests 9/9, sitemap vacío porque la indexación está apagada.
- 2026-10-14: rediseño completo "automotive discovery" (azul MotoGuía, Archivo, sin serif ni naranja). Header con diálogo de búsqueda, drawer móvil y contador del comparador; `MotorcycleCard` única; catálogo con sidebar y drawer de filtros; plantillas nuevas de marca, ficha, home, rankings, herramientas, comparador, guías y páginas informativas. Fotos normalizadas en `public/images/motos/stage/`.
- Pendiente de contenido: no hay logos oficiales de marcas con permiso en el repo (se usan nombres tipográficos); cada modelo tiene una sola foto; las fotos SIAM conservan líneas del catálogo original y SUNRA usa recortes manuales en `scripts/normalize-images.py`.
