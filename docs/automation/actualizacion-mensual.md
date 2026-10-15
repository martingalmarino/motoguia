# Actualización mensual: manual para el agente

Este manual lo sigue la automatización programada de Cursor los días 10 y 25 de cada mes. Trabaja sobre `main` del repo `martingalmarino/motoguia` y publica sola: no hay nadie para revisar antes del push. Ante la duda, no cambies el dato.

Reglas generales:

- No inventes ni estimes datos. Cada número nuevo tiene que salir de un documento que puedas citar con URL y fecha.
- No cambies textos editoriales, diseño ni código salvo lo que pide este manual.
- No toques los precios de los modelos listados en `src/data/price-sources.json`: los actualiza la GitHub Action del día 5.
- Si no hay datos nuevos, terminá sin commitear.

## 1. Ranking de patentamientos (ACARA/SIOMAA)

1. Mirá el último ranking cargado: el archivo mensual más reciente en `src/content/rankings/` (por ejemplo `2026-08.json`, campo `periodEnd`).
2. Buscá el informe de mercado de motos (2W) de ACARA/SIOMAA del mes siguiente. Lugares donde suele aparecer:
   - acara.org.ar (sección de estadísticas o informes).
   - autoblog.com.ar, que aloja los PDF (`wp-content/uploads/.../AAAA.MM-ACARA.-Informe-de-Mercado-2W...pdf`).
   - Notas de prensa que citen el informe (Ámbito, TN, Infobae, iProfesional).
   Usá solo el informe de ACARA/SIOMAA como fuente del ranking. El boletín de CADECOM agrupa versiones y usa otro universo: no lo mezcles.
3. Si no hay un informe más nuevo que el cargado, pasá al punto 2 del manual.
4. Si lo hay, leé del PDF:
   - La tabla del mes (top 20 por unidades del mes, con la variación frente al mes anterior).
   - La tabla del acumulado del año (top 20 por unidades acumuladas).
   - Los totales del mes y del acumulado.
   - Si el informe trae el total de alguna marca eléctrica (por ejemplo SUNRA), su cifra acumulada.
5. Creá o actualizá los archivos con el mismo formato que los existentes:
   - `src/content/rankings/AAAA-MM.json` con `"id": "ranking-AAAA-MM"`, `"periodType": "monthly"`, `periodStart` y `periodEnd` del mes, `totalUnits` del mes y `comparisonPeriod` con el mes anterior en cada fila (por ejemplo `"septiembre 2026"`).
   - `src/content/rankings/AAAA-ytd.json` con `"id": "ranking-AAAA-ytd"`, `"periodType": "yearToDate"`, `periodStart` el 1 de enero, el mismo `periodEnd` que el mensual, `totalUnits` acumulado y `brandTotals` si corresponde. En enero se crea el archivo del año nuevo; el del año anterior queda como está.
   - Actualizá `reportScope`, `methodology`, `seoTitle` y `seoDescription` con el período nuevo. Copiá la redacción de los archivos existentes y cambiá solo mes, año y cifras.
   - `reportPublishedAt` es la fecha del informe y `verifiedAt` la fecha de hoy.
6. Nombres de modelos: copiá `reportModelName` tal cual figura en el informe. Para `modelIds`, buscá el nombre en `src/data/ranking-aliases.json`:
   - Si está, usá exactamente esos `modelIds`.
   - Si no está, usá `[]` y agregá el nombre a `ranking-aliases.json` con `[]`. Solo asociá un nombre nuevo a una ficha si un documento lo respalda (manual, sitio oficial o concesionario), igual que KN110-8 con la Crono Classic 110.
7. Agregá la fuente nueva a `src/data/sources.json` con `id` `acara-siomaa-AAAA-MM`, título, URL del PDF, `publisher`, `publishedAt`, `accessedAt` y `supports`. Si usaste una nota de prensa para confirmar el top, agregala también.
8. Control cruzado: si hay una nota de prensa con el top 3 del mes, compará. Si no coincide con tu lectura del PDF, no publiques el ranking y anotá la diferencia en el resumen.

## 2. Precios del resto de las marcas

Para cada ficha publicada en `src/content/motorcycles/` que no esté en `src/data/price-sources.json`:

1. Revisá la página oficial del modelo (la URL está en `src/data/sources.json`, en la fuente del modelo).
2. Si la marca publica un precio de lista, cargalo:
   - `price.minARS` y `price.maxARS` (iguales si hay una sola versión), `priceType: list`, `observedAt` con la fecha de hoy y `sourceIds` con la fuente oficial.
   - Si hay precio por versión, completá `versions[].priceARS`.
   - `includesRegistration`: `true` o `false` solo si la página lo dice; si no, `null`.
3. Si la marca no publica precio, buscá una cotización fechada en una fuente citable (nota de prensa o concesionario oficial con fecha). Usá `priceType: quoted`, agregá la fuente a `sources.json` y poné en `observedAt` la fecha de la cotización.
4. No cargues precios de marketplaces, clasificados, ni promociones sin fecha.
5. Si el precio nuevo difiere más de 35% del anterior, no lo cargues y anotalo en el resumen.
6. Si no encontrás nada nuevo, dejá el precio como está. El sitio avisa solo cuando un precio tiene más de 90 días.

## 3. Cierre

1. Corré `npm ci` si hace falta y después `npm run build`. Tiene que terminar sin errores: valida contenido, alias del ranking, fuentes, tests y tipos.
2. Si falla, corregí solo errores de formato de lo que cargaste. Si no podés resolverlo, descartá los cambios (`git checkout -- .`) y terminá sin publicar.
3. Si pasa y hubo cambios, escribí `docs/actualizaciones/AAAA-MM.md` (mes de la corrida) con:
   - Ranking: período cargado y fuente, o "sin informe nuevo".
   - Precios: modelos actualizados con valor anterior, valor nuevo y fuente; modelos revisados sin cambios; diferencias descartadas y por qué.
   Si el archivo ya existe (corrida del día 10), agregá una sección para la corrida del día 25.
4. Commit con autor `Martin <56572703+martingalmarino@users.noreply.github.com>` y mensaje `Actualización mensual AAAA-MM: ranking <mes> y precios`. Push a `main` (sin `--force`). Vercel publica solo.
