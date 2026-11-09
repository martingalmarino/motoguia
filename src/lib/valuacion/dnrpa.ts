export type TipoCode = 'M' | 'S' | 'C' | 'Q' | 'T' | 'X';

export type BrandIndex = {
  marcas: { n: string; s: string }[];
};

export type ModelRecord = {
  t: TipoCode;
  v: [number | '0km', number][];
  e?: number[];
};

export type BrandFile = Record<string, ModelRecord>;

const TIPO_LABEL: Record<TipoCode, string> = {
  M: 'Motocicleta',
  S: 'Scooter',
  C: 'Ciclomotor',
  Q: 'Cuatriciclo',
  T: 'Triciclo',
  X: 'Sin especificación',
};

export function tipoLabel(code: TipoCode): string {
  return TIPO_LABEL[code] ?? 'Motovehículo';
}

export function isBrandIndex(value: unknown): value is BrandIndex {
  if (!value || typeof value !== 'object' || !('marcas' in value)) return false;
  const marcas = (value as { marcas: unknown }).marcas;
  return Array.isArray(marcas) && marcas.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const row = item as { n?: unknown; s?: unknown };
    return typeof row.n === 'string' && typeof row.s === 'string';
  });
}

export function isBrandFile(value: unknown): value is BrandFile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((item) => {
    if (!item || typeof item !== 'object') return false;
    const model = item as Partial<ModelRecord>;
    return typeof model.t === 'string' && Array.isArray(model.v);
  });
}
