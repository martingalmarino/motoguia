import { describe, expect, it } from 'vitest';
import { calculatePatent, type PatentResult } from '../src/lib/calculators/patente';

function pesos(result: PatentResult, label: string) {
  const line = result.lines.find((item) => item.label === label);
  if (!line || !('amount' in line)) throw new Error(`Sin importe para ${label}`);
  return line.amount;
}

describe('calculadora de patente', () => {
  it('estima CABA para una valuación de $3.200.000', () => {
    const result = calculatePatent({
      jurisdiction: 'caba',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 109,
    });
    expect(result.kind).toBe('amount');
    expect(pesos(result, 'Impuesto (escala Art. 50)')).toBe(51_200);
    expect(pesos(result, 'Fondo Subte (+10%)')).toBe(5_120);
    expect(result.annual).toBe(56_320);
  });

  it('aplica el mínimo anual de CABA cuando la escala da menos', () => {
    const result = calculatePatent({
      jurisdiction: 'caba',
      valuation: 100_000,
      year: 2020,
      displacementCc: 110,
    });
    expect(result.annual).toBe(13_300);
  });

  it('exime en Tucumán a las motos de hasta 125 cc', () => {
    for (const displacementCc of [110, 125]) {
      const result = calculatePatent({
        jurisdiction: 'tucuman',
        valuation: 3_200_000,
        year: 2024,
        displacementCc,
      });
      expect(result.kind).toBe('exempt');
      expect(result.annual).toBe(0);
      expect(result.message).toMatch(/125 cc/);
    }
  });

  it('cobra el 2% en Tucumán cuando la moto supera los 125 cc', () => {
    const result = calculatePatent({
      jurisdiction: 'tucuman',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 126,
    });
    expect(result.kind).toBe('amount');
    expect(result.annual).toBe(64_000);
    expect(result.installments).toBe(1);
  });

  it('no estima en Tucumán la exención por antigüedad sin el tope oficial', () => {
    const result = calculatePatent({
      jurisdiction: 'tucuman',
      valuation: 3_200_000,
      year: 2010,
      displacementCc: 150,
    });
    expect(result.kind).toBe('unconfirmed');
    expect(result.annual).toBeNull();
  });

  it('explica el cobro municipal en la Provincia de Buenos Aires sin calcular un monto', () => {
    const result = calculatePatent({
      jurisdiction: 'buenos-aires',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 110,
    });
    expect(result.kind).toBe('municipal');
    expect(result.annual).toBeNull();
    expect(result.message).toMatch(/no ARBA/);
  });

  it('deja en próximamente a una provincia sin alícuota verificada', () => {
    const result = calculatePatent({
      jurisdiction: 'la-rioja',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 110,
    });
    expect(result.kind).toBe('soon');
    expect(result.annual).toBeNull();
  });

  it('avisa en Córdoba que el resultado es solo el impuesto provincial', () => {
    const result = calculatePatent({
      jurisdiction: 'cordoba',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 110,
    });
    expect(result.kind).toBe('amount');
    expect(result.annual).toBe(27_200);
    expect(result.warning).toMatch(/municipal/i);
  });

  it('no estima una moto eléctrica en Córdoba', () => {
    const result = calculatePatent({
      jurisdiction: 'cordoba',
      valuation: 3_200_000,
      year: 2024,
      displacementCc: 0,
    });
    expect(result.kind).toBe('unconfirmed');
    expect(result.annual).toBeNull();
  });
});
