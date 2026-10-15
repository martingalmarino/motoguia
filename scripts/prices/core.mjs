/** Variación máxima aceptada entre una corrida y la siguiente. Más que eso se trata como error de lectura. */
export const MAX_CHANGE = 0.35;

/** Fecha de hoy en Argentina, en formato AAAA-MM-DD. */
export function todayInArgentina(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Decide qué hacer con los precios leídos de la fuente.
 * @param {{ minARS: number | null, versions: Record<string, number | null> }} current
 * @param {{ label: string, priceARS: number }[]} scraped
 * @param {Record<string, string>} mapping nombre en la fuente -> nombre de la versión en la ficha
 */
export function planPriceUpdate(current, scraped, mapping) {
  if (scraped.length === 0) return { status: 'parse-error', reason: 'No se encontró ningún precio en la página.' };

  const mapped = Object.keys(mapping).length > 0;
  const versionPrices = {};
  if (mapped) {
    for (const item of scraped) {
      const name = mapping[item.label];
      if (!name) return { status: 'unmapped-version', reason: `Versión nueva o renombrada en la fuente: "${item.label}".` };
      versionPrices[name] = item.priceARS;
    }
    const missing = Object.values(mapping).filter((name) => versionPrices[name] === undefined);
    if (missing.length > 0) return { status: 'missing-version', reason: `La fuente ya no muestra: ${missing.join(', ')}.` };
  } else if (scraped.length > 1) {
    return { status: 'unmapped-version', reason: `La fuente muestra ${scraped.length} versiones y la ficha espera una.` };
  }

  const prices = mapped ? Object.values(versionPrices) : [scraped[0].priceARS];
  const minARS = Math.min(...prices);
  const maxARS = Math.max(...prices);

  const pairs = mapped
    ? Object.entries(versionPrices).map(([name, value]) => [current.versions[name] ?? current.minARS, value])
    : [[current.minARS, minARS]];
  for (const [before, after] of pairs) {
    if (before && Math.abs(after - before) / before > MAX_CHANGE) {
      return {
        status: 'rejected-threshold',
        reason: `El precio pasaría de ${before} a ${after}, una variación mayor al ${MAX_CHANGE * 100}%.`,
        minARS,
        maxARS,
      };
    }
  }

  const changed =
    current.minARS !== minARS ||
    (mapped && Object.entries(versionPrices).some(([name, value]) => current.versions[name] !== value));
  return { status: changed ? 'updated' : 'unchanged', minARS, maxARS, versionPrices: mapped ? versionPrices : {} };
}

/** Lee el precio actual de la ficha: mínimo y precio por versión. */
export function readCurrentPrice(text) {
  const minARS = Number(text.match(/^price:\n(?:  .*\n)*?  minARS: (\d+)/m)?.[1] ?? NaN);
  const versions = {};
  const block = text.match(/^versions:\n((?: {2}.*\n|\n)*)/m)?.[1] ?? '';
  for (const item of block.split(/^ {2}- /m).slice(1)) {
    const name = item.match(/^name: "?([^"\n]+)"?/)?.[1];
    const price = item.match(/^ {4}priceARS: (\d+|null)/m)?.[1];
    if (name) versions[name] = price && price !== 'null' ? Number(price) : null;
  }
  return { minARS: Number.isFinite(minARS) ? minARS : null, versions };
}

/**
 * Reescribe el bloque `price:` y los `priceARS` de las versiones sin tocar el resto del frontmatter.
 * @param {string} text
 * @param {{ minARS: number, maxARS: number, versionPrices: Record<string, number>, observedAt: string, sourceId: string }} update
 */
export function applyPriceUpdate(text, update) {
  const priceBlock = text.match(/^price:(?: null)?\n(?: {2}.*\n)*/m);
  if (!priceBlock) throw new Error('No se encontró el bloque price en la ficha.');
  const old = priceBlock[0];
  const keep = (key, fallback) => old.match(new RegExp(`^  ${key}: (.+)$`, 'm'))?.[1] ?? fallback;
  const block = [
    'price:',
    `  minARS: ${update.minARS}`,
    `  maxARS: ${update.maxARS}`,
    `  priceType: ${keep('priceType', 'list')}`,
    `  includesRegistration: ${keep('includesRegistration', 'null')}`,
    `  observedAt: ${update.observedAt}`,
    '  sourceIds:',
    `    - ${update.sourceId}`,
    '',
  ].join('\n');
  let next = text.replace(old, block);

  for (const [name, value] of Object.entries(update.versionPrices)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^ {2}- name: "?${escaped}"?\\n(?: {4}.*\\n)*? {4}priceARS: )(\\d+|null)`, 'm');
    if (!pattern.test(next)) throw new Error(`No se encontró la versión "${name}" en la ficha.`);
    next = next.replace(pattern, `$1${value}`);
  }
  return next;
}

/** Actualiza `accessedAt` de una fuente en sources.json sin reformatear el archivo. */
export function touchSource(json, sourceId, date) {
  const start = json.indexOf(`"id": "${sourceId}"`);
  if (start < 0) throw new Error(`No existe la fuente ${sourceId}.`);
  const nextId = json.indexOf('"id": "', start + 1);
  const end = nextId < 0 ? json.length : nextId;
  const segment = json.slice(start, end).replace(/"accessedAt": "[^"]*"/, `"accessedAt": "${date}"`);
  return json.slice(0, start) + segment + json.slice(end);
}
