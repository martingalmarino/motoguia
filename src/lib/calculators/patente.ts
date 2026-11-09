import { formatArs } from '../format';

/** Reglas de patente de motos vigentes para 2026. Los importes salen de la normativa citada; no se completan datos que la fuente no publica. */

export const FISCAL_YEAR = 2026;

export const DNRPA_VALUATION_URL = 'https://www.dnrpa.gov.ar/portal_dnrpa/valuaciones2';
export const DNRPA_VALUATION_CITE = 'Valuación: tabla DNRPA vigente desde 01/11/2026 (DN 00160/2026)';

export type PatentLine = { label: string; amount: number } | { label: string; text: string };

type JurisdictionMeta = {
  name: string;
  collector: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type PatentResult = {
  kind: 'amount' | 'exempt' | 'municipal' | 'soon' | 'unconfirmed';
  jurisdictionName: string;
  collector?: string;
  annual: number | null;
  installments: number | null;
  lines: PatentLine[];
  message?: string;
  warning?: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type PatentInput = {
  jurisdiction: string;
  valuation: number;
  year: number | '0km';
  displacementCc: number;
};

const CABA: JurisdictionMeta = {
  name: 'CABA',
  collector: 'Ciudad (AGIP)',
  sourceLabel: 'Ley Impositiva CABA 2026 Art. 50; AGIP — Tabla de valuaciones 2026',
  sourceUrl: 'https://buenosaires.gob.ar/sites/default/files/2026-10/PL-LEY-LCABA-LCBA-6927-25-ANX.pdf',
};

const BUENOS_AIRES: JurisdictionMeta = {
  name: 'Buenos Aires (Provincia)',
  collector: 'Municipal',
  sourceLabel: 'Ley Impositiva PBA 2026 Art. 33; Ley Orgánica de Municipalidades Art. 226 inc. 10',
  sourceUrl: 'https://leyes-ar.com/ley_impositiva_para_el_ejercicio_fiscal_2026_buenos_aires/33.htm',
};

const CORDOBA: JurisdictionMeta = {
  name: 'Córdoba',
  collector: 'Provincial (Rentas Córdoba)',
  sourceLabel: 'Ley 11090/2025 Arts. 55–56 (Rentas Córdoba)',
  sourceUrl: 'https://www.rentascordoba.gob.ar/cms/wp-content/uploads/2026/02/ley_n_11090_–_ley_impositiva_anual_2026.pdf',
};

const SANTA_FE: JurisdictionMeta = {
  name: 'Santa Fe',
  collector: 'Provincial (API)',
  sourceLabel: 'API — alícuotas MT 2026; Código Fiscal Art. 314',
  sourceUrl: 'https://www.santafe.gov.ar/e-pt-cons-valua/ALICUOTAS-MT.pdf',
};

const MENDOZA: JurisdictionMeta = {
  name: 'Mendoza',
  collector: 'Provincial (ATM)',
  sourceLabel: 'Ley Impositiva Mendoza 2026 — Grupo VI Motovehículos',
  sourceUrl: 'https://atm.mendoza.gov.ar/wp-content/uploads/2025/12/Ley-Impositiva-2026.pdf',
};

const CATAMARCA: JurisdictionMeta = {
  name: 'Catamarca',
  collector: 'Provincial (ARCAT / DGR)',
  sourceLabel: 'Ley 5927 Catamarca 2026 — Categoría C',
  sourceUrl: 'https://dgrentas.arcat.gob.ar/leyes_Decretos/2026/legislacion_leyes%20y%20decretos_2026_ley5927.pdf',
};

const TUCUMAN: JurisdictionMeta = {
  name: 'Tucumán',
  collector: 'Provincial (DGR Rentas Tucumán)',
  sourceLabel: 'Ley Impositiva Tucumán Art. 17; CTP Arts. 304 y 307',
  sourceUrl: 'https://www.rentastucuman.gob.ar/nomina/rentastuc2/nwx1ut2pa3lo/leyimpositiva.pdf',
};

export const SOON_JURISDICTIONS: { id: string; name: string }[] = [
  { id: 'la-rioja', name: 'La Rioja' },
  { id: 'neuquen', name: 'Neuquén' },
  { id: 'entre-rios', name: 'Entre Ríos' },
  { id: 'corrientes', name: 'Corrientes' },
  { id: 'misiones', name: 'Misiones' },
  { id: 'chaco', name: 'Chaco' },
  { id: 'formosa', name: 'Formosa' },
  { id: 'salta', name: 'Salta' },
  { id: 'jujuy', name: 'Jujuy' },
  { id: 'santiago-del-estero', name: 'Santiago del Estero' },
  { id: 'san-juan', name: 'San Juan' },
  { id: 'san-luis', name: 'San Luis' },
  { id: 'la-pampa', name: 'La Pampa' },
  { id: 'rio-negro', name: 'Río Negro' },
  { id: 'chubut', name: 'Chubut' },
  { id: 'santa-cruz', name: 'Santa Cruz' },
  { id: 'tierra-del-fuego', name: 'Tierra del Fuego' },
];

const SOON = new Map(SOON_JURISDICTIONS.map((item) => [item.id, item.name]));

const CABA_BRACKETS: { until: number; rate: number; fixed?: number; from?: number }[] = [
  { until: 7_460_000, rate: 0.016 },
  { until: 17_155_000, rate: 0.04, fixed: 119_350, from: 7_460_000 },
  { until: 26_850_000, rate: 0.045, fixed: 507_150, from: 17_155_000 },
  { until: 36_550_000, rate: 0.055, fixed: 943_500, from: 26_850_000 },
  { until: 50_350_000, rate: 0.065, fixed: 1_477_000, from: 36_550_000 },
  { until: 73_100_000, rate: 0.07, fixed: 2_374_000, from: 50_350_000 },
  { until: Number.POSITIVE_INFINITY, rate: 0.08, fixed: 3_965_000, from: 73_100_000 },
];

function metaResult(meta: JurisdictionMeta, extra: Omit<PatentResult, 'jurisdictionName' | 'sourceLabel' | 'sourceUrl'>): PatentResult {
  return {
    jurisdictionName: meta.name,
    collector: meta.collector,
    sourceLabel: meta.sourceLabel,
    sourceUrl: meta.sourceUrl,
    ...extra,
  };
}

function assertCalculable(input: PatentInput) {
  if (!Number.isFinite(input.valuation) || input.valuation <= 0) {
    throw new Error('La valuación tiene que ser un número mayor que cero.');
  }
  if (!Number.isFinite(input.displacementCc) || input.displacementCc < 0) {
    throw new Error('La cilindrada tiene que ser un número mayor o igual que cero.');
  }
  if (input.year !== '0km' && (!Number.isInteger(input.year) || input.year < 1980 || input.year > FISCAL_YEAR + 1)) {
    throw new Error('El año del modelo no es válido.');
  }
}

function modelAge(year: number | '0km'): number {
  if (year === '0km') return 0;
  return FISCAL_YEAR - year;
}

function percentLabel(rate: number): string {
  return `${(rate * 100).toFixed(2).replace('.', ',')}%`;
}

function calculateCaba(valuation: number): { annual: number; lines: PatentLine[] } {
  const bracket = CABA_BRACKETS.find((item) => valuation <= item.until) ?? CABA_BRACKETS[CABA_BRACKETS.length - 1];
  const base = bracket.fixed === undefined || bracket.from === undefined
    ? valuation * bracket.rate
    : bracket.fixed + (valuation - bracket.from) * bracket.rate;
  const detail = bracket.fixed === undefined
    ? `${percentLabel(bracket.rate)} sobre la valuación`
    : `Cuota fija ${formatArs(bracket.fixed)} + ${percentLabel(bracket.rate)} sobre el excedente`;
  const subte = base * 0.1;
  let total = base + subte;
  const lines: PatentLine[] = [
    { label: 'Impuesto (escala Art. 50)', amount: base },
    { label: 'Fondo Subte (+10%)', amount: subte },
  ];
  const cap = valuation * 0.06;
  if (total > cap) {
    lines.push({ label: 'Tope efectivo 6% de la valuación', amount: cap });
    total = cap;
  }
  const minimum = 13_300;
  if (total < minimum) {
    lines.push({ label: 'Se aplica el mínimo anual', amount: minimum });
    total = minimum;
  }
  lines.push({ label: 'Detalle de tramo', text: detail });
  return { annual: total, lines };
}

function calculateCordoba(input: PatentInput): PatentResult {
  const { valuation, year } = input;
  if (input.displacementCc === 0) {
    return metaResult(CORDOBA, {
      kind: 'unconfirmed',
      annual: null,
      installments: null,
      lines: [],
      message: 'Córdoba reduce 50% a híbridos/eléctricos fabricados en la provincia (Art. 60). Sin ese dato no aplicamos el descuento ni estimamos un monto.',
    });
  }
  const numericYear = year === '0km' ? FISCAL_YEAR : year;
  if (numericYear <= 2021 && !(numericYear >= 2014 && valuation >= 19_400_000)) {
    return metaResult(CORDOBA, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: `Según Art. 57, los motovehículos modelo ${numericYear} no están alcanzados por el impuesto provincial (salvo valuación ≥ $19.400.000 en modelos 2014–2021).`,
    });
  }
  let base = 0;
  let detail = '';
  if (valuation <= 15_785_242) {
    base = valuation * 0.0085;
    detail = '0,85% hasta $15.785.242';
  } else if (valuation <= 24_354_374) {
    base = 134_174.56 + (valuation - 15_785_242) * 0.0149;
    detail = 'Fijo $134.174,56 + 1,49% sobre excedente';
  } else if (valuation <= 32_784_734) {
    base = 261_854.62 + (valuation - 24_354_374) * 0.0185;
    detail = 'Fijo $261.854,62 + 1,85% sobre excedente';
  } else {
    base = 417_816.28 + (valuation - 32_784_734) * 0.021;
    detail = 'Fijo $417.816,28 + 2,10% sobre excedente';
  }
  const minimum = 7_100;
  let total = base;
  const lines: PatentLine[] = [
    { label: 'Impuesto provincial (escala Art. 55)', amount: base },
    { label: 'Detalle de tramo', text: detail },
  ];
  if (total < minimum) {
    lines.push({ label: 'Se aplica el mínimo anual para motos', amount: minimum });
    total = minimum;
  }
  return metaResult(CORDOBA, {
    kind: 'amount',
    annual: total,
    installments: null,
    lines,
    warning: 'En Córdoba suele sumarse una tasa o contribución municipal (Automotor Unificado). Este resultado es solo el impuesto provincial; confirmá el monto municipal en tu localidad.',
  });
}

function calculateSantaFe(input: PatentInput): PatentResult {
  const age = modelAge(input.year);
  const { valuation, displacementCc: cc } = input;
  if (cc <= 150 && age > 15) {
    return metaResult(SANTA_FE, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: 'En Santa Fe, las motos de hasta 150 cc con más de 15 años están exentas.',
    });
  }
  if (cc > 150 && age > 20) {
    return metaResult(SANTA_FE, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: 'En Santa Fe, las motos de más de 150 cc con más de 20 años están exentas.',
    });
  }
  const base = valuation * 0.02;
  let minimum = cc <= 150 ? 7_800 : 13_000;
  if (age > 15) minimum = cc <= 150 ? 3_900 : 6_500;
  const lines: PatentLine[] = [
    { label: 'Alícuota 2% sobre valuación', amount: base },
    { label: 'Mínimo aplicable', amount: minimum },
  ];
  const total = Math.max(base, minimum);
  if (total === minimum && base < minimum) {
    lines.push({ label: 'Se aplica el mínimo (no la alícuota)', amount: minimum });
  }
  return metaResult(SANTA_FE, { kind: 'amount', annual: total, installments: null, lines });
}

function calculateMendoza(input: PatentInput): PatentResult {
  if (input.year !== '0km' && (input.year < 2000 || input.year > FISCAL_YEAR)) {
    return metaResult(MENDOZA, {
      kind: 'unconfirmed',
      annual: null,
      installments: null,
      lines: [],
      message: 'La escala disponible cubre modelos 2000–2026. Para este año, dato a confirmar en ATM.',
    });
  }
  const brackets: [number, number][] = [
    [7_100_000, 0.015],
    [14_200_000, 0.016],
    [23_700_000, 0.017],
    [35_500_000, 0.018],
    [47_300_000, 0.02],
    [59_100_000, 0.0225],
    [87_500_000, 0.025],
    [Number.POSITIVE_INFINITY, 0.03],
  ];
  const rate = brackets.find(([until]) => input.valuation <= until)?.[1] ?? 0.03;
  let base = input.valuation * rate;
  const lines: PatentLine[] = [{ label: `Alícuota ${percentLabel(rate)} (tramo por valuación)`, amount: base }];
  if (input.displacementCc === 0) {
    base *= 0.5;
    lines.push({ label: 'Reducción 50% híbridos/eléctricos', amount: base });
  }
  if (input.valuation <= 10_000_000) {
    lines.push({ label: 'Pago Único Liberatorio (PUL)', text: 'Disponible para valuación ≤ $10.000.000 (consultar ATM)' });
  }
  return metaResult(MENDOZA, { kind: 'amount', annual: base, installments: null, lines });
}

function calculateCatamarca(input: PatentInput): PatentResult {
  const numericYear = input.year === '0km' ? FISCAL_YEAR : input.year;
  if (numericYear <= 2005) {
    return metaResult(CATAMARCA, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: 'En Catamarca están exentas las motos con 20 años o más al 31/12/2025 (modelos 2005 o anteriores).',
    });
  }
  const rate = input.displacementCc === 0 ? 0.015 : 0.02;
  const base = input.valuation * rate;
  const minimum = 13_400;
  let total = base;
  const rateLabel = `${(rate * 100).toFixed(1).replace('.', ',')}%`;
  const lines: PatentLine[] = [
    { label: `Alícuota ${rateLabel}${input.displacementCc === 0 ? ' (híbridos/eléctricos)' : ''}`, amount: base },
  ];
  if (total < minimum) {
    lines.push({ label: 'Se aplica el mínimo anual', amount: minimum });
    total = minimum;
  }
  lines.push({
    label: 'Tope interanual y descuentos por pago anual',
    text: 'Dato a confirmar (falta impuesto 2025 / condiciones Art. 12)',
  });
  return metaResult(CATAMARCA, { kind: 'amount', annual: total, installments: 12, lines });
}

function calculateTucuman(input: PatentInput): PatentResult {
  const age = modelAge(input.year);
  if (input.displacementCc > 125 && age > 15) {
    return metaResult(TUCUMAN, {
      kind: 'unconfirmed',
      annual: null,
      installments: null,
      lines: [],
      message: 'La exención por antigüedad (>15 años) depende de un tope de valor que fija el Poder Ejecutivo y no está en la fuente usada. No estimamos este caso.',
    });
  }
  if (input.displacementCc > 0 && input.displacementCc <= 125) {
    return metaResult(TUCUMAN, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: 'En Tucumán están exentas las motocicletas de hasta 125 cc (CTP Art. 307 inc. 12).',
    });
  }
  if (age > 15) {
    return metaResult(TUCUMAN, {
      kind: 'exempt',
      annual: 0,
      installments: null,
      lines: [],
      message: 'En Tucumán, las unidades con más de 15 años pueden estar exentas (CTP Art. 307). El tope de valor lo fija el Poder Ejecutivo: dato a confirmar si aplica a tu valuación.',
      warning: 'La exención por antigüedad tiene un tope de valor que no está detallado en la fuente usada; confirmalo en Rentas Tucumán.',
    });
  }
  const base = input.valuation * 0.02;
  return metaResult(TUCUMAN, {
    kind: 'amount',
    annual: base,
    installments: 1,
    lines: [{ label: 'Alícuota 2% sobre valuación', amount: base }],
  });
}

function asPesos(result: PatentResult): PatentResult {
  if (typeof result.annual !== 'number') return result;
  return { ...result, annual: Math.round(result.annual) };
}

export function calculatePatent(input: PatentInput): PatentResult {
  return asPesos(calculatePatentRules(input));
}

function calculatePatentRules(input: PatentInput): PatentResult {
  if (input.jurisdiction === 'buenos-aires') {
    return metaResult(BUENOS_AIRES, {
      kind: 'municipal',
      annual: null,
      installments: null,
      lines: [],
      message: 'no ARBA. No hay una alícuota provincial unificada. Para estimar el monto necesitás el partido y la ordenanza local. Consultá en tu municipalidad.',
    });
  }
  const soonName = SOON.get(input.jurisdiction);
  if (soonName) {
    return {
      kind: 'soon',
      jurisdictionName: soonName,
      annual: null,
      installments: null,
      lines: [],
      sourceLabel: '',
      sourceUrl: '',
      message: 'Todavía no tenemos la alícuota oficial verificada para esta jurisdicción. Cuando esté publicada la vamos a sumar.',
    };
  }
  assertCalculable(input);
  switch (input.jurisdiction) {
    case 'caba': {
      const result = calculateCaba(input.valuation);
      return metaResult(CABA, { kind: 'amount', annual: result.annual, installments: null, lines: result.lines });
    }
    case 'cordoba':
      return calculateCordoba(input);
    case 'santa-fe':
      return calculateSantaFe(input);
    case 'mendoza':
      return calculateMendoza(input);
    case 'catamarca':
      return calculateCatamarca(input);
    case 'tucuman':
      return calculateTucuman(input);
    default:
      throw new Error('Jurisdicción desconocida.');
  }
}

export function roundPesos(value: number): number {
  return Math.round(value);
}
