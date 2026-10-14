# Pautas editoriales de MotoGuía

Promesa: “Te ayudamos a entender cada moto y a compararla con criterio, en un lenguaje claro y cercano.”

Estas pautas valen para toda ficha nueva o editada. Complementan `docs/EDITORIAL_POLICY.md` (qué se puede afirmar) y `docs/CONTENT_GUIDE.md` (dónde va cada campo).

## Voz

- Español argentino, voseo natural (“podés”, “compará”, “tené en cuenta”). No todas las oraciones le hablan al lector.
- Tercera persona para describir la moto; segunda persona solo para consejos prácticos.
- Oraciones cortas o medianas, párrafos de dos a cuatro oraciones. Sustantivos y verbos concretos.
- Tono informativo y equilibrado: ni vendedor de concesionaria ni auditor interno.
- Seguridad al afirmar lo documentado, precisión al marcar lo incierto.
- Si un término técnico cambia la decisión (CBS, ABS, potencia nominal), explicalo en una frase.

No usar:

- Ironía o reproche a la marca (“otra vez no publica la potencia”).
- Narración defensiva (“no inventamos cifras”, “no completamos con datos de Brasil”).
- Diario de investigación (“la ficha PDF que usamos”, “no se pudo extraer”, “en el extracto”, “la página consultada”).
- Lenguaje de venta vacío (“compañera perfecta”, “experiencia inigualable”) o jerga forzada (“la nave”, “una bestia”).
- Aperturas clonadas, preguntas retóricas de rutina, “no es X, es Y” repetido.
- Experiencia de manejo propia cuando no hay prueba documentada.
- Frases que anuncian la estructura (“en esta sección vas a encontrar…”).

## Qué se puede afirmar

Base: los datos estructurados de la ficha y sus fuentes, para la misma versión, año y mercado argentino. La prosa existente no prueba nada por sí misma.

Sí: especificaciones y equipamiento declarados, diferencias de versión documentadas, explicación llana de cómo funciona un elemento declarado, interpretación prudente pegada al dato, comparaciones entre motos realmente comparables.

No, sin evidencia: “consume poco”, “es cómoda”, “frena muy bien”, “es confiable”, “hay repuestos en todos lados”, “buena reventa”, “ideal para principiantes”, “sirve para delivery”, “es segura”, “la más vendida” (sin período y fuente).

- CBS no es ABS. Potencia nominal y pico no son lo mismo. Autonomía declarada no es autonomía medida.
- Un dato faltante no es un defecto: sin consumo publicado no significa que gaste mucho; ABS desconocido no es “sin ABS”.
- Un tanque grande es un dato; “mucha autonomía” requiere consumo o alcance documentado.

## Estructura de la ficha

| Campo | Uso | Extensión |
| --- | --- | --- |
| `editorial.summary` | Lead del hero y resultado del buscador. Empieza por la moto, no por el ranking ni por lo que falta. | 2 o 3 oraciones, 30–60 palabras |
| Cuerpo Markdown | “Lo principal de esta moto”: identidad, rasgos relevantes, versiones, una consideración útil. | 2–4 párrafos, ~120–250 palabras si hay evidencia; menos si no |
| `editorial.strengths` | “Puntos destacados” (se muestran 3). Rasgos que diferencian. | Frases cortas |
| `editorial.limitations` | “Qué tener en cuenta”. Solo puntos que cambian la decisión. | 1–3 ítems |
| `editorial.suitableFor` | “Para quién tiene sentido”. Ligado a un rasgo documentado. | 1–2 ítems |
| `editorial.ownershipNotes` | Bloque de costos: garantía, service, confirmaciones de compra. | 1–3 oraciones |
| `versions[].note`, `versionNote`, `specVersion` | Qué dato corresponde a qué versión. | Breve |
| `dataNotes` | Notas de fuente en “Fuentes y actualización”: conflictos entre documentos, cruces con el ranking, conversiones, cotizaciones de prensa. | Una oración por nota |
| `seoDescription` | Única, factual, menos de 160 caracteres, con el nombre del modelo. | — |

No repitas en prosa cada fila de la ficha técnica: elegí lo que distingue a la moto.

## Fechas, precios y ranking

- La narrativa no lleva “en 2026”, “hoy”, “este mes” salvo que el año identifique una versión técnica.
- Precios exactos y su fecha viven en `price` y `versions[].priceARS`, que el componente de precio muestra con tipo y fecha. Nunca en la prosa ni en el resumen.
- Si no se sabe si el precio incluye patentamiento, la ficha muestra: “Confirmá con el vendedor el precio final y los gastos de entrega y patentamiento.”
- Puesto, unidades, período y filas del informe ACARA/SIOMAA van en las páginas de ranking y en `dataNotes`/`rankingReportNames`. No abrir una ficha con el puesto ni convertir un puesto en “es muy popular”.
- “Patentamientos” son inscripciones, no ventas.
- `reviewedAt` es la fecha de revisión editorial. No mover `price.observedAt` ni `availabilityCheckedAt` si no se volvió a verificar ese dato.

## Datos faltantes y fuentes

- La ficha técnica muestra “No informado”. La prosa no explica una y otra vez por qué falta.
- Las salvedades materiales quedan junto al dato: fecha junto al precio, condiciones junto a la autonomía, versión junto al equipamiento, límites junto a la garantía.
- Nunca publicar fallas de extracción, nombres de archivo, TODOs ni pasos de investigación.

## Búsqueda de control antes de publicar

Buscar en `src/content/motorcycles/`: “no inventamos”, “ficha que usamos”, “PDF”, “no se pudo”, “extracto”, “otra vez”, “página consultada”, “página revisada”, “ACARA”, “patentamientos”, “2026”, “$”. Revisar cada coincidencia en contexto: en `dataNotes`, `price` y `rankingReportNames` pueden ser legítimas.
