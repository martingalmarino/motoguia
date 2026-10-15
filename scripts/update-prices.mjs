// Uso: node scripts/update-prices.mjs [--dry-run]
// Lee los precios de las fuentes oficiales listadas en src/data/price-sources.json,
// actualiza las fichas y deja un informe en reports/precios-AAAA-MM.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyPriceUpdate, planPriceUpdate, readCurrentPrice, todayInArgentina, touchSource } from './prices/core.mjs';
import { parseHondaPrices } from './prices/honda.mjs';

const root = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const adapters = { honda: parseHondaPrices };
const today = todayInArgentina();
const priceSources = JSON.parse(readFileSync(join(root, 'src/data/price-sources.json'), 'utf8'));
const sourcesPath = join(root, 'src/data/sources.json');
let sourcesJson = readFileSync(sourcesPath, 'utf8');

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'MotoGuiaAR/1.0 (+https://www.motoguia.com.ar/metodologia/)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

const report = [];
for (const [modelId, config] of Object.entries(priceSources)) {
  const file = join(root, 'src/content/motorcycles', `${modelId}.md`);
  const text = readFileSync(file, 'utf8');
  const current = readCurrentPrice(text);
  const row = { modelId, url: config.url, before: current, status: 'fetch-error' };
  try {
    const adapter = adapters[config.adapter];
    if (!adapter) throw new Error(`Adaptador desconocido: ${config.adapter}`);
    const scraped = adapter(await fetchHtml(config.url));
    const plan = planPriceUpdate(current, scraped, config.versions);
    Object.assign(row, { scraped, ...plan });
    if (plan.status === 'updated' || plan.status === 'unchanged') {
      const next = applyPriceUpdate(text, {
        minARS: plan.minARS,
        maxARS: plan.maxARS,
        versionPrices: plan.versionPrices,
        observedAt: today,
        sourceId: config.sourceId,
      });
      sourcesJson = touchSource(sourcesJson, config.sourceId, today);
      if (!dryRun) writeFileSync(file, next);
    }
  } catch (error) {
    row.reason = error instanceof Error ? error.message : String(error);
  }
  report.push(row);
  console.log(`${modelId}: ${row.status}${row.reason ? ` (${row.reason})` : ''}`);
}

if (!dryRun) {
  writeFileSync(sourcesPath, sourcesJson);
  mkdirSync(join(root, 'reports'), { recursive: true });
  const reportPath = join(root, 'reports', `precios-${today.slice(0, 7)}.json`);
  writeFileSync(reportPath, `${JSON.stringify({ checkedAt: today, results: report }, null, 2)}\n`);
  console.log(`Informe: ${reportPath}`);
}

const failed = report.filter((row) => !['updated', 'unchanged'].includes(row.status));
if (failed.length === report.length) {
  console.error('No se pudo verificar ningún precio.');
  process.exitCode = 1;
}
