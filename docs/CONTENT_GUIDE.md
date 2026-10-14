# Guía de contenido

## Agregar una ficha

1. Copiá `content/templates/motorcycle.md` a `src/content/motorcycles/[id].md`.
2. El `id` del frontmatter tiene que coincidir con el nombre de archivo.
3. `status: published` solo con identidad local verificada, cuerpo editorial, fuentes y fechas reales.
4. Specs desconocidos: `null`. Nunca 0 para “no sabemos”.
5. Imagen: silueta local o foto con derechos anotados. Nada de hotlink. Después corré `python3 scripts/normalize-images.py` para generar la versión sobre fondo blanco (`public/images/motos/stage/*-600.webp` y `*-1200.webp`) que usan tarjetas, fichas y comparador.
6. Versiones: si la marca publica más de una, cargalas en `versions` (nombre, precio o `null`, nota corta). `versionNote` explica de dónde salen los datos y `specVersion` indica a qué versión corresponde la ficha técnica; se muestra junto a los datos clave.
7. Corré `npm run validate` y `npm run build`.

## Ranking

Editá `src/content/rankings/2026-ytd.json` y `2026-08.json`. No pises un año viejo. `modelIds` solo si hay cruce documental con una ficha publicada.

## Precio

Cambiar un precio es editar el objeto `price` (monto, `observedAt`, `sourceIds`). No toques `reviewedAt` si solo rebuildaste.

## Afiliados

Cargá URLs reales en datos, no en el template. `rel="sponsored noopener"` y el texto “Ver en Mercado Libre”.
