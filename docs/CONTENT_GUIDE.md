# Guía de contenido

## Agregar una ficha

1. Copiá `content/templates/motorcycle.md` a `src/content/motorcycles/[id].md`.
2. El `id` del frontmatter tiene que coincidir con el nombre de archivo.
3. `status: published` solo con identidad local verificada, cuerpo editorial, fuentes y fechas reales.
4. Specs desconocidos: `null`. Nunca 0 para “no sabemos”.
5. Imagen: silueta local o foto con derechos anotados. Nada de hotlink.
6. Corré `npm run validate` y `npm run build`.

## Ranking

Editá `src/content/rankings/2026-ytd.json` y `2026-08.json`. No pises un año viejo. `modelIds` solo si hay cruce documental con una ficha publicada.

## Precio

Cambiar un precio es editar el objeto `price` (monto, `observedAt`, `sourceIds`). No toques `reviewedAt` si solo rebuildaste.

## Afiliados

Cargá URLs reales en datos, no en el template. `rel="sponsored noopener"` y el texto “Ver en Mercado Libre”.
