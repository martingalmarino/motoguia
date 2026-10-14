# Informe de reescritura editorial

Fecha: 14 de octubre de 2026. Criterios aplicados: `docs/EDITORIAL_GUIDELINES.md`.

## Resumen

- Modelos publicados en `src/content/motorcycles`: **21** (0 borradores).
- Reescritos y revisados: **20**.
- Parciales por falta de evidencia: **1** (Mondial LD 110 MAX).
- Sin procesar: **0** fichas de modelo. Las guías quedan pendientes de una reescritura completa (ver más abajo).

En cada ficha se reescribieron el resumen del hero (`editorial.summary`, que también usa `/buscar`), los usos sugeridos, los puntos destacados, lo que hay que tener en cuenta, la nota de costos, la meta descripción, las notas de versión y el cuerpo. `reviewedAt` quedó en 2026-10-14. No cambiaron diseño, URLs, slugs ni fórmulas.

## Modelos reescritos y revisados

| Modelo | Ruta | Archivo |
| --- | --- | --- |
| Corven Energy 110 | `/motos/corven/corven-energy-110/` | `src/content/motorcycles/corven-energy-110.md` |
| Corven Mirage 110 | `/motos/corven/corven-mirage-110/` | `src/content/motorcycles/corven-mirage-110.md` |
| Corven Triax 150 | `/motos/corven/corven-triax-150/` | `src/content/motorcycles/corven-triax-150.md` |
| Gilera Sahel 150 | `/motos/gilera/gilera-sahel-150/` | `src/content/motorcycles/gilera-sahel-150.md` |
| Gilera Smash | `/motos/gilera/gilera-smash/` | `src/content/motorcycles/gilera-smash.md` |
| Honda GLH 150 | `/motos/honda/honda-glh-150/` | `src/content/motorcycles/honda-glh-150.md` |
| Honda Navi | `/motos/honda/honda-navi/` | `src/content/motorcycles/honda-navi.md` |
| Honda Wave 110S | `/motos/honda/honda-wave-110s/` | `src/content/motorcycles/honda-wave-110s.md` |
| Honda XR150L | `/motos/honda/honda-xr150l/` | `src/content/motorcycles/honda-xr150l.md` |
| Keller Crono Classic 110 | `/motos/keller/keller-crono-classic-110/` | `src/content/motorcycles/keller-crono-classic-110.md` |
| Motomel Blitz 110 | `/motos/motomel/motomel-blitz-110/` | `src/content/motorcycles/motomel-blitz-110.md` |
| Motomel C110 DLX | `/motos/motomel/motomel-c110-dlx/` | `src/content/motorcycles/motomel-c110-dlx.md` |
| Motomel S2 150 | `/motos/motomel/motomel-s2-150/` | `src/content/motorcycles/motomel-s2-150.md` |
| Motomel StratoE | `/motos/motomel/motomel-stratoe/` | `src/content/motorcycles/motomel-stratoe.md` |
| SIAM N4 | `/motos/siam/siam-n4/` | `src/content/motorcycles/siam-n4.md` |
| SIAM QU 110 | `/motos/siam/siam-qu-110/` | `src/content/motorcycles/siam-qu-110.md` |
| SUNRA Future | `/motos/sunra/sunra-future/` | `src/content/motorcycles/sunra-future.md` |
| SUNRA Miku Max | `/motos/sunra/sunra-miku-max/` | `src/content/motorcycles/sunra-miku-max.md` |
| Zanella ZB 110 FULL | `/motos/zanella/zanella-zb-110/` | `src/content/motorcycles/zanella-zb-110.md` |
| Zanella ZB 110 ST | `/motos/zanella/zanella-zb-110-z3-st/` | `src/content/motorcycles/zanella-zb-110-z3-st.md` |

Cambios comunes a todas las fichas:

- El texto abre con la moto (formato, cilindrada, caja y frenos) y no con su posición en el ranking ni con el proceso de investigación.
- Se sacaron del texto los precios exactos, las fechas y las posiciones en el ranking. El precio queda solo en el componente de precio, con su fecha y tipo.
- Se separa CBS de ABS cada vez que aparece frenado combinado.
- Se aclara la base de cada peso (en seco, en orden de marcha o sin base informada) y se compara solo entre bases iguales.
- Los datos declarados por la marca se presentan como declarados, sin hablar de experiencia de manejo.
- La nota de costos (`ownershipNotes`) quedó como consejo práctico. La garantía va en `warranty` y la licencia en `licenceHint`, para que el panel no repita información.

Cambios de datos verificados en fuentes primarias durante la reescritura:

- **Zanella ZB 110 FULL y ST:** se completaron chasis, medidas, refrigeración, transmisión, neumáticos y tanque con las fichas técnicas PDF de Zanella (nuevas fuentes `zanella-zb-full-pdf` y `zanella-zb-st-pdf`). En la FULL se cargó el consumo declarado (1,8 l/100 km), aclarando que la marca no informa el método de medición.
- **SIAM N4, SUNRA Future y SUNRA Miku Max:** velocidades máximas (45, 80 y 40 km/h), medidas, neumáticos y equipamiento tomados de las páginas oficiales.
- **Motomel StratoE:** química de batería (litio).
- **Bases de peso** normalizadas en Energy, QU 110, N4, Smash, Wave y Mirage.

## Parcial por falta de evidencia

- **Mondial LD 110 MAX** (`/motos/mondial/mondial-ld-110-max/`, `src/content/motorcycles/mondial-ld-110-max.md`): la web de Mondial publica equipamiento (CBS, LED, USB, baúl), pero la ficha técnica es una imagen sin texto extraíble. Cilindrada, potencia, peso y tanque siguen como “No informado”. El texto se limita al equipamiento y sugiere pedir la ficha completa en el concesionario.

## Información reubicada

- **Precios:** fuera de la narrativa. Siguen en el componente de precio con fecha, tipo (lista, cotizado o referencia) y aclaración sobre patentamiento. Si no se sabe qué incluye el precio, el panel de costos muestra: “Confirmá con el vendedor el precio final y los gastos de entrega y patentamiento.”
- **Ranking de patentamientos:** las posiciones y unidades quedaron en `/motos-mas-vendidas/`. En la ficha, el nombre de la fila del informe sale de `rankingReportNames`, y las aclaraciones de vínculo (filas separadas, versiones agrupadas, códigos como B110 o KN110-8) pasaron a `dataNotes`.
- **Notas de fuente y conflictos entre documentos:** pasaron a `dataNotes` (campo nuevo), que se muestra en Fuentes, dentro de “Notas sobre los datos de esta ficha”.

## Cambios de plantilla y esquema

- `src/lib/content/schema.ts`: nuevo campo `dataNotes` (lista de textos, vacío por defecto).
- `src/pages/motos/[marca]/[modelo].astro`: muestra `dataNotes` en Fuentes y agrega la nota de precio final en el panel de costos cuando no se sabe si el precio incluye patentamiento.

## Alcance secundario

- **Comparativas (5):** se reescribieron el cuerpo, la descripción y la meta descripción de `glh-150-vs-s2-150`, `n4-vs-stratoe`, `qu-110-vs-zb-110`, `wave-110s-vs-smash` y `xr150l-vs-triax-150`. Se sacaron los precios exactos y las cifras de ranking, y se sumaron las fuentes de garantía y fichas PDF que respaldan el texto.
- **Marcas:** las notas de origen de `src/data/brands.json` quedaron sin lenguaje de proceso (“ficha consultada”, “páginas revisadas”, “eso no prueba…”).
- **Guías:** solo se corrigieron frases puntuales en `moto-110-125-150`, `garantia-repuestos-servicio`, `primera-moto-argentina` y `cuanto-cuesta-mantener-moto`. **Pendiente:** reescribir las guías completas con los mismos criterios.

## Problemas de datos y bloqueos

- **Mondial LD 110 MAX:** ficha técnica solo en imagen; faltan datos básicos.
- **Zanella ZB 110 FULL:** la ficha usa los datos de la FULL, pero está vinculada a la fila genérica “ZANELLA ZB 110” del informe, que también tiene una fila “ZB 110 Z3 FULL”. Conviene decidir si se suman.
- **Zanella ZB 110:** la ficha técnica dice caja manual y la web, semiautomática. Se informan las dos versiones y se sugiere confirmarlo al cotizar.
- **Keller Crono Classic 110:** el manual de la FULL indica neumático trasero 2.75 x 14 y horquilla invertida, y la web, 80/100-14 y horquilla telescópica. La ficha usa la web.
- **Motomel Blitz 110:** el manual declara 7,1 hp y la página del producto, 7 hp. El vínculo con la fila B110 sale de concesionarios y prensa, no de Motomel.
- **Corven Energy 110:** el neumático delantero 110/90-17 publicado es inusual para una cub; conviene confirmarlo con la marca.
- **Motomel S2 150:** sus medidas casi coinciden con las de la Blitz; puede ser un error de carga en la web de Motomel.
- **Gilera Sahel 150:** el precio de referencia sale de una nota de prensa y no de una lista de Gilera.
- **Datos que las marcas no publican:** Honda no informa potencia ni consumo; Corven no informa peso ni potencia de la Triax 150. Esos campos figuran como “No informado”.

## Validación

- Búsqueda de control en `src/content/motorcycles` (PDF, “página consultada”, ACARA, patentamientos, 2026, `$`, “no se inventa”, “otra vez”, “ideal”, “económica”). Las coincidencias que quedan están en `dataNotes`, IDs de fuentes, condiciones de garantía (“unidades 2026”) o en la condición de autonomía declarada por SUNRA (“condiciones ideales”).
- Búsqueda en el HTML generado de frases de proceso (“no inventamos”, “ficha consultada”, “páginas revisadas”, “proxy”, “rellenar”): sin resultados.
- `npm run build` (astro check, validate-content, tests y build): 0 errores, 21 fichas sin bloqueos, 9 tests pasados y 67 páginas generadas.
- Revisión en el navegador a 390 px y 1440 px de Wave 110S (varias versiones), SUNRA Future (eléctrica sin precio), Mondial LD 110 MAX (sin precio y con datos parciales), GLH 150 (una sola versión), Keller (notas de datos), StratoE y Sahel (panel de costos) y la comparativa Wave vs Smash.

## Riesgos

- Los textos que comparan modelos del catálogo (por ejemplo, “la única cub con disco trasero” o “la mayor potencia declarada entre las cub”) dependen del catálogo actual. Hay que revisarlos cuando se agreguen modelos.
- Las garantías y los precios cambian. Las fichas toman la garantía de `warranty` y el precio del componente, así que alcanza con actualizar esos campos.
