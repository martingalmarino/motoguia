import { describe, expect, it } from 'vitest';
import {
  calculateFuelCost,
  calculateMonthlyOwnership,
  consumptionFromKmPerLiter,
  parseArNumber,
} from '../src/lib/calculators';

describe('fuel calculator', () => {
  it('matches the synthetic example', () => {
    const result = calculateFuelCost({
      monthlyKm: 1000,
      consumptionL100km: 2.5,
      pricePerLiter: 1500,
    });
    expect(result.litersPerMonth).toBe(25);
    expect(result.monthlyFuelCost).toBe(37500);
    expect(result.costPerKm).toBe(37.5);
    expect(result.annualFuelCost).toBe(450000);
  });

  it('converts km/L', () => {
    expect(consumptionFromKmPerLiter(40)).toBe(2.5);
  });

  it('rejects invalid consumption', () => {
    expect(() => consumptionFromKmPerLiter(0)).toThrow();
    expect(() =>
      calculateFuelCost({ monthlyKm: 0, consumptionL100km: -1, pricePerLiter: 1 }),
    ).toThrow();
  });

  it('allows zero distance', () => {
    expect(
      calculateFuelCost({ monthlyKm: 0, consumptionL100km: 2.5, pricePerLiter: 1500 }).monthlyFuelCost,
    ).toBe(0);
  });
});

describe('ownership calculator', () => {
  it('matches the synthetic example', () => {
    const result = calculateMonthlyOwnership({
      monthlyFuelCost: 37500,
      monthlyInsurance: 20000,
      annualTax: 120000,
      maintenanceProvision: 15000,
      monthlyParking: 5000,
      monthlyOther: 0,
    });
    expect(result.monthlyTotal).toBe(87500);
    expect(result.annualScenario).toBe(1050000);
  });
});

describe('Argentine number parser', () => {
  it('parses 1.500,50 as 1500.5', () => {
    expect(parseArNumber('1.500,50')).toEqual({ ok: true, value: 1500.5 });
  });

  it('does not treat 1.500 as 1.5', () => {
    expect(parseArNumber('1.500')).toEqual({ ok: true, value: 1500 });
  });

  it('parses comma decimals', () => {
    expect(parseArNumber('2,5')).toEqual({ ok: true, value: 2.5 });
  });

  it('rejects blanks separately', () => {
    expect(parseArNumber('')).toEqual({ ok: false, error: 'blank' });
  });
});
