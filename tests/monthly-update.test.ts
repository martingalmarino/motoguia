import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { latestByPeriodEnd, periodLabel, periodPhrase, periodShortLabel } from '../src/lib/content/ranking-period';
import { MAX_CHANGE, applyPriceUpdate, planPriceUpdate, readCurrentPrice, todayInArgentina, touchSource } from '../scripts/prices/core.mjs';
import { parseHondaPrices } from '../scripts/prices/honda.mjs';

const date = (value: string) => new Date(`${value}T00:00:00Z`);
const ytd = { periodType: 'yearToDate' as const, periodStart: date('2026-01-01'), periodEnd: date('2026-08-31') };
const month = { periodType: 'monthly' as const, periodStart: date('2026-08-01'), periodEnd: date('2026-08-31') };

describe('ranking period labels', () => {
  it('describes year-to-date and monthly periods', () => {
    expect(periodLabel(ytd)).toBe('enero-agosto 2026');
    expect(periodPhrase(ytd)).toBe('de enero a agosto de 2026');
    expect(periodShortLabel(ytd)).toBe('ene-ago 2026');
    expect(periodLabel(month)).toBe('agosto 2026');
    expect(periodPhrase(month)).toBe('agosto de 2026');
  });

  it('treats a January year-to-date ranking as a single month', () => {
    const january = { periodType: 'yearToDate' as const, periodStart: date('2027-01-01'), periodEnd: date('2027-01-31') };
    expect(periodLabel(january)).toBe('enero 2027');
  });

  it('picks the ranking with the latest period end', () => {
    const items = [
      { id: 'a', data: { ...month, periodEnd: date('2026-07-31') } },
      { id: 'b', data: month },
      { id: 'c', data: { ...month, periodEnd: date('2025-12-31') } },
    ];
    expect(latestByPeriodEnd(items)?.id).toBe('b');
  });
});

describe('ranking aliases', () => {
  const aliases = JSON.parse(readFileSync(join(process.cwd(), 'src/data/ranking-aliases.json'), 'utf8')) as Record<string, string[]>;
  const dir = join(process.cwd(), 'src/content/rankings');

  it('cover every row in the published rankings', () => {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
      const ranking = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      for (const row of ranking.rows) {
        expect(aliases[row.reportModelName], `${file}: ${row.reportModelName}`).toEqual(row.modelIds);
      }
    }
  });

  it('only point to existing models', () => {
    const models = new Set(readdirSync(join(process.cwd(), 'src/content/motorcycles')).map((file) => file.replace(/\.md$/, '')));
    for (const ids of Object.values(aliases)) {
      for (const id of ids) expect(models.has(id), id).toBe(true);
    }
  });
});

describe('Honda price adapter', () => {
  const html = readFileSync(join(process.cwd(), 'tests/fixtures/honda-wave-110s.html'), 'utf8');

  it('reads one price per version', () => {
    expect(parseHondaPrices(html)).toEqual([
      { label: 'FRENO A TAMBOR', priceARS: 3529700 },
      { label: 'FRENO A DISCO', priceARS: 4020800 },
    ]);
  });

  it('returns nothing for a page without prices', () => {
    expect(parseHondaPrices('<html><body>Sin precios</body></html>')).toEqual([]);
  });
});

describe('price update plan', () => {
  const mapping = { 'FRENO A TAMBOR': 'Tambor', 'FRENO A DISCO': 'Cast Disc' };
  const current = { minARS: 3529707, versions: { Tambor: 3529707, 'Cast Disc': 4020800 } };

  it('updates when the official price changes', () => {
    const plan = planPriceUpdate(
      current,
      [
        { label: 'FRENO A TAMBOR', priceARS: 3529700 },
        { label: 'FRENO A DISCO', priceARS: 4020800 },
      ],
      mapping,
    );
    expect(plan).toMatchObject({ status: 'updated', minARS: 3529700, maxARS: 4020800 });
  });

  it(`rejects changes above ${MAX_CHANGE * 100}%`, () => {
    const plan = planPriceUpdate(
      current,
      [
        { label: 'FRENO A TAMBOR', priceARS: 9_000_000 },
        { label: 'FRENO A DISCO', priceARS: 4020800 },
      ],
      mapping,
    );
    expect(plan.status).toBe('rejected-threshold');
  });

  it('stops when the source renames or drops a version', () => {
    expect(planPriceUpdate(current, [{ label: 'FRENO A DISCO CBS', priceARS: 4_000_000 }], mapping).status).toBe(
      'unmapped-version',
    );
    expect(planPriceUpdate(current, [{ label: 'FRENO A DISCO', priceARS: 4_000_000 }], mapping).status).toBe(
      'missing-version',
    );
    expect(planPriceUpdate({ minARS: 100, versions: {} }, [], {}).status).toBe('parse-error');
  });

  it('marks an identical price as unchanged', () => {
    expect(planPriceUpdate({ minARS: 3434700, versions: {} }, [{ label: 'NAVI', priceARS: 3434700 }], {}).status).toBe(
      'unchanged',
    );
  });
});

describe('frontmatter edits', () => {
  const text = [
    '---',
    'id: demo',
    'price:',
    '  minARS: 100',
    '  maxARS: 200',
    '  priceType: list',
    '  includesRegistration: null',
    '  observedAt: 2026-09-18',
    '  sourceIds:',
    '    - old-source',
    '    - press',
    'engine:',
    '  displacementCc: 109',
    'versions:',
    '  - name: "Tambor"',
    '    priceARS: 100',
    '    note: "A"',
    '  - name: "Cast Disc"',
    '    priceARS: 200',
    '    note: "B"',
    'versionNote: null',
    '---',
    '',
  ].join('\n');

  it('reads the current price and versions', () => {
    expect(readCurrentPrice(text)).toEqual({ minARS: 100, versions: { Tambor: 100, 'Cast Disc': 200 } });
  });

  it('rewrites only the price block and version prices', () => {
    const next = applyPriceUpdate(text, {
      minARS: 110,
      maxARS: 210,
      versionPrices: { Tambor: 110, 'Cast Disc': 210 },
      observedAt: '2026-10-05',
      sourceId: 'official',
    });
    expect(next).toContain('  minARS: 110\n  maxARS: 210\n  priceType: list\n  includesRegistration: null\n  observedAt: 2026-10-05\n  sourceIds:\n    - official\nengine:');
    expect(next).toContain('  - name: "Tambor"\n    priceARS: 110\n');
    expect(next).toContain('  - name: "Cast Disc"\n    priceARS: 210\n');
    expect(next).toContain('engine:\n  displacementCc: 109\n');
  });

  it('touches only the accessed date of the given source', () => {
    const json = '[\n  {\n    "id": "a",\n    "accessedAt": "2026-01-01"\n  },\n  {\n    "id": "b",\n    "accessedAt": "2026-01-01"\n  }\n]\n';
    const next = touchSource(json, 'b', '2026-10-05');
    expect(next).toContain('"id": "a",\n    "accessedAt": "2026-01-01"');
    expect(next).toContain('"id": "b",\n    "accessedAt": "2026-10-05"');
  });

  it('uses the Argentina calendar date', () => {
    expect(todayInArgentina(new Date('2026-10-06T02:00:00Z'))).toBe('2026-10-05');
  });
});
