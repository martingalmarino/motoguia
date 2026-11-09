/**
 * Regenera el JSON de valuaciones de motovehículos a partir de un CSV
 * con columnas: marca, modelo/versión, tipo, año, valuación.
 *
 * Uso:
 *   node scripts/build-dnrpa-valuacion.mjs <archivo.csv> [directorio-salida]
 *
 * El directorio de salida por defecto es public/data/valuacion-dnrpa.
 * Solo se conservan motovehículos. Los duplicados tipográficos
 * (por ejemplo WAVE 110S y WAVE 110 S) se unifican si no contradicen
 * la valuación. Un año ausente se completa con +8% sobre el año
 * inmediato anterior únicamente cuando el hueco es de un solo año
 * entre dos años publicados; si no, ese año no se muestra.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS = new Map([
  ['MOTOCICLETA', 'M'],
  ['SCOOTER', 'S'],
  ['CICLOMOTOR', 'C'],
  ['CUATRICICLO', 'Q'],
  ['TRICICLO', 'T'],
  ['SIN ESPECIFICACION', 'X'],
]);

const TIPO_LABEL = {
  M: 'motocicleta',
  S: 'scooter',
  C: 'ciclomotor',
  Q: 'cuatriciclo',
  T: 'triciclo',
  X: 'sin especificación',
};

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

export function normalizeModelKey(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

export function brandSlug(name) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'marca';
}

function preferName(current, candidate) {
  const spaces = (value) => (value.match(/ /g) ?? []).length;
  if (spaces(candidate) !== spaces(current)) return spaces(candidate) > spaces(current) ? candidate : current;
  if (candidate.length !== current.length) return candidate.length > current.length ? candidate : current;
  return candidate.localeCompare(current, 'es') < 0 ? candidate : current;
}

function csvRows(text) {
  const table = parseCsv(text);
  const header = table[0]?.map((cell) => cell.trim().toLowerCase()) ?? [];
  const index = {
    marca: header.indexOf('marca'),
    modelo: header.findIndex((cell) => cell.startsWith('modelo')),
    tipo: header.indexOf('tipo'),
    anio: header.findIndex((cell) => cell === 'año' || cell === 'anio'),
    valuacion: header.findIndex((cell) => cell.startsWith('valuaci')),
  };
  if (Object.values(index).some((value) => value < 0)) {
    throw new Error('El CSV no tiene las columnas marca, modelo, tipo, año y valuación.');
  }
  return table.slice(1).map((cells) => ({
    marca: (cells[index.marca] ?? '').trim(),
    modelo: (cells[index.modelo] ?? '').trim(),
    tipo: (cells[index.tipo] ?? '').trim().toUpperCase(),
    anio: (cells[index.anio] ?? '').trim().toLowerCase(),
    valuacion: (cells[index.valuacion] ?? '').trim(),
  }));
}

/**
 * @param {string} csvText
 * @returns {{ index: { marcas: { n: string, s: string }[] }, brands: Map<string, Record<string, unknown>>, stats: Record<string, number> }}
 */
export function buildValuacion(csvText) {
  const stats = {
    filas: 0,
    omitidasTipo: 0,
    omitidasVacias: 0,
    conflictos: 0,
    modelos: 0,
    aniosInferidos: 0,
  };
  /** @type {Map<string, Map<string, Map<string, { name: string, years: Map<string, number | 'conflict'> }>>>} */
  const brands = new Map();

  for (const row of csvRows(csvText)) {
    stats.filas += 1;
    const tipo = TIPOS.get(row.tipo);
    if (!tipo) {
      stats.omitidasTipo += 1;
      continue;
    }
    if (!row.marca || !row.modelo) {
      stats.omitidasVacias += 1;
      continue;
    }
    const amount = Number(row.valuacion);
    if (!Number.isInteger(amount) || amount <= 0) {
      stats.omitidasVacias += 1;
      continue;
    }
    const yearKey = row.anio === '0km' ? '0km' : /^\d{4}$/.test(row.anio) ? String(Number(row.anio)) : '';
    if (!yearKey || (yearKey !== '0km' && (Number(yearKey) < 1980 || Number(yearKey) > 2100))) {
      stats.omitidasVacias += 1;
      continue;
    }
    const key = `${tipo}:${normalizeModelKey(row.modelo)}`;
    if (!brands.has(row.marca)) brands.set(row.marca, new Map());
    const models = brands.get(row.marca);
    if (!models.has(key)) models.set(key, new Map());
    const variants = models.get(key);
    if (!variants.has(row.modelo)) variants.set(row.modelo, { name: row.modelo, years: new Map() });
    const entry = variants.get(row.modelo);
    const previous = entry.years.get(yearKey);
    if (previous === undefined) entry.years.set(yearKey, amount);
    else if (previous !== amount) {
      entry.years.set(yearKey, 'conflict');
      stats.conflictos += 1;
    }
  }

  /** @type {Map<string, { n: string, file: Record<string, { t: string, v: (string | number)[][], e?: number[] }> }>} */
  const files = new Map();
  const usedSlugs = new Map();

  for (const marca of [...brands.keys()].sort((a, b) => a.localeCompare(b, 'es'))) {
    let slug = brandSlug(marca);
    if (usedSlugs.has(slug)) {
      let n = 2;
      while (usedSlugs.has(`${slug}-${n}`)) n += 1;
      slug = `${slug}-${n}`;
    }
    usedSlugs.set(slug, marca);
    /** @type {Record<string, { t: string, v: (string | number)[][], e?: number[] }>} */
    const file = {};
    const pending = [];

    for (const [key, variants] of brands.get(marca)) {
      const tipo = key.slice(0, 1);
      const cleaned = [...variants.values()]
        .map((variant) => {
          const years = new Map();
          for (const [year, value] of variant.years) {
            if (value === 'conflict') continue;
            years.set(year, value);
          }
          return years.size > 0 ? { name: variant.name, years } : null;
        })
        .filter(Boolean);
      if (cleaned.length === 0) continue;

      const merged = tryMerge(cleaned);
      const pieces = merged ? [merged] : cleaned;
      for (const piece of pieces) pending.push({ tipo, ...withArt2(piece) });
    }

    const grouped = new Map();
    for (const piece of pending) {
      if (!grouped.has(piece.name)) grouped.set(piece.name, []);
      grouped.get(piece.name).push(piece);
    }
    const entries = [];
    for (const [name, pieces] of grouped) {
      const repeated = pieces.length > 1;
      for (const piece of pieces) {
        let key = repeated ? `${name} (${TIPO_LABEL[piece.tipo]})` : name;
        if (entries.some((entry) => entry.key === key)) key = `${key} (${entries.length})`;
        const record = { t: piece.tipo, v: piece.values };
        if (piece.inferred.length > 0) record.e = piece.inferred;
        entries.push({ key, record });
        stats.modelos += 1;
        stats.aniosInferidos += piece.inferred.length;
      }
    }
    for (const entry of entries.sort((a, b) => a.key.localeCompare(b.key, 'es'))) file[entry.key] = entry.record;

    files.set(slug, { n: marca, file });
  }

  const index = {
    marcas: [...files.entries()]
      .map(([slug, value]) => ({ n: value.n, s: slug }))
      .sort((a, b) => a.n.localeCompare(b.n, 'es')),
  };
  const brandsOut = new Map([...files.entries()].map(([slug, value]) => [slug, value.file]));
  return { index, brands: brandsOut, stats };
}

function tryMerge(variants) {
  const years = new Map();
  let name = variants[0].name;
  for (const variant of variants) {
    name = preferName(name, variant.name);
    for (const [year, value] of variant.years) {
      const previous = years.get(year);
      if (previous === undefined) years.set(year, value);
      else if (previous !== value) return null;
    }
  }
  return { name, years };
}

function withArt2(model) {
  const official = new Map();
  let zeroKm = null;
  for (const [year, value] of model.years) {
    if (year === '0km') zeroKm = value;
    else official.set(Number(year), value);
  }
  const inferred = [];
  const present = [...official.keys()].sort((a, b) => a - b);
  for (let i = 0; i < present.length - 1; i += 1) {
    const current = present[i];
    const next = present[i + 1];
    if (next - current !== 2) continue;
    const year = current + 1;
    inferred.push(year);
    official.set(year, Math.round(official.get(current) * 1.08));
  }
  const values = [];
  if (zeroKm !== null) values.push(['0km', zeroKm]);
  for (const year of [...official.keys()].sort((a, b) => b - a)) values.push([year, official.get(year)]);
  return { name: model.name, values, inferred: inferred.sort((a, b) => b - a) };
}

export function writeValuacion(built, outDir) {
  mkdirSync(outDir, { recursive: true });
  for (const name of readdirSync(outDir)) {
    if (name.endsWith('.json')) rmSync(join(outDir, name));
  }
  writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(built.index)}\n`);
  for (const [slug, file] of built.brands) {
    writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(file));
  }
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Uso: node scripts/build-dnrpa-valuacion.mjs <archivo.csv> [directorio-salida]');
    process.exit(1);
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const outDir = resolve(process.argv[3] ?? join(root, 'public/data/valuacion-dnrpa'));
  const built = buildValuacion(readFileSync(resolve(csvPath), 'utf8'));
  writeValuacion(built, outDir);
  console.log(
    `Marcas: ${built.index.marcas.length}. Modelos: ${built.stats.modelos}. Años estimados (+8%): ${built.stats.aniosInferidos}. Años en conflicto omitidos: ${built.stats.conflictos}. Filas de otro tipo omitidas: ${built.stats.omitidasTipo}.`,
  );
  console.log(outDir);
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invoked) main();
