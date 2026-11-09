import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildValuacion, normalizeModelKey } from '../scripts/build-dnrpa-valuacion.mjs';

type YearCell = [number | '0km', number];
type ModelRow = { t: string; v: YearCell[]; e?: number[] };
type Built = {
  brands: Map<string, Record<string, ModelRow>>;
  stats: { omitidasTipo: number };
};

function brandFile(built: Built, slug: string) {
  const file = built.brands.get(slug);
  if (!file) throw new Error(slug);
  return file;
}

function modelRow(file: Record<string, ModelRow>, name: string) {
  const row = file[name];
  if (!row) throw new Error(name);
  return row;
}

const csv = `marca,modelo/versión,tipo,año,valuación
HONDA,WAVE 110 S,MOTOCICLETA,2024,2312400
HONDA,WAVE 110S,MOTOCICLETA,2024,2312400
HONDA,WAVE 110S,MOTOCICLETA,2022,2000000
HONDA,WAVE 110,MOTOCICLETA,2024,1000000
HONDA,MODELO RARO,AUTO,2024,500000
ZANELLA,ZB,MOTOCICLETA,2010,100000
ZANELLA,ZB,MOTOCICLETA,2012,130000
MONDIAL,HD 150,MOTOCICLETA,2008,100
MONDIAL,HD 150,MOTOCICLETA,2008,250
MONDIAL,HD 150,MOTOCICLETA,2010,300
CFMOTO,CFORCE,CUATRICICLO,2024,9000000
`;

describe('valuación DNRPA', () => {
  it('normaliza espacios y guiones', () => {
    expect(normalizeModelKey('WAVE 110 S')).toBe(normalizeModelKey('WAVE 110S'));
    expect(normalizeModelKey('AX-100')).toBe(normalizeModelKey('AX 100'));
    expect(normalizeModelKey('WAVE 110')).not.toBe(normalizeModelKey('WAVE 110 S'));
  });

  it('deduplica, conserva motovehículos y solo completa un hueco de un año', () => {
    const built = buildValuacion(csv) as unknown as Built;
    const honda = brandFile(built, 'honda');
    expect(honda['WAVE 110S']).toBeUndefined();
    expect(honda['WAVE 110']).toBeTruthy();
    const wave = modelRow(honda, 'WAVE 110 S');
    expect(wave.t).toBe('M');
    expect(wave.v).toEqual([
      [2024, 2_312_400],
      [2023, 2_160_000],
      [2022, 2_000_000],
    ]);
    expect(wave.e).toEqual([2023]);
    expect(honda['MODELO RARO']).toBeUndefined();

    const zanella = modelRow(brandFile(built, 'zanella'), 'ZB');
    expect(zanella.v).toContainEqual([2011, 108_000]);
    expect(zanella.e).toEqual([2011]);
    expect(zanella.v.some(([year]) => year === 2013)).toBe(false);

    const mondial = modelRow(brandFile(built, 'mondial'), 'HD 150');
    expect(mondial.v).toEqual([[2010, 300]]);
    expect(mondial.e).toBeUndefined();

    expect(modelRow(brandFile(built, 'cfmoto'), 'CFORCE').t).toBe('Q');
    expect(built.stats.omitidasTipo).toBe(1);
  });
});

describe('tabla publicada', () => {
  const honda = JSON.parse(readFileSync(join(process.cwd(), 'public/data/valuacion-dnrpa/honda.json'), 'utf8'));
  const index = JSON.parse(readFileSync(join(process.cwd(), 'public/data/valuacion-dnrpa/index.json'), 'utf8'));

  it('trae la Honda Wave 110 S de la tabla vigente, sin el duplicado tipográfico', () => {
    expect(index.marcas).toEqual(expect.arrayContaining([{ n: 'HONDA', s: 'honda' }]));
    expect(honda['WAVE 110S']).toBeUndefined();
    expect(honda['WAVE 110']).toBeTruthy();
    expect(honda['WAVE 110 S'].v).toEqual(expect.arrayContaining([
      ['0km', 3_327_100],
      [2025, 2_800_100],
      [2024, 2_312_400],
    ]));
  });
});
