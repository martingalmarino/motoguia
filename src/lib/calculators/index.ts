export type FuelInputs = {
  monthlyKm: number | null;
  consumptionL100km: number | null;
  pricePerLiter: number | null;
};

export type FuelResult = {
  litersPerMonth: number;
  monthlyFuelCost: number;
  costPerKm: number;
  annualFuelCost: number;
};

export function consumptionFromKmPerLiter(kmPerLiter: number): number {
  if (!Number.isFinite(kmPerLiter) || kmPerLiter <= 0) {
    throw new Error('km/L debe ser un número finito mayor que cero.');
  }
  return 100 / kmPerLiter;
}

export function calculateFuelCost(input: FuelInputs): FuelResult {
  const { monthlyKm, consumptionL100km, pricePerLiter } = input;
  if (monthlyKm === null || consumptionL100km === null || pricePerLiter === null) {
    throw new Error('Faltan datos para calcular el gasto de combustible.');
  }
  if (![monthlyKm, consumptionL100km, pricePerLiter].every((value) => Number.isFinite(value))) {
    throw new Error('Los valores tienen que ser números finitos.');
  }
  if (monthlyKm < 0 || consumptionL100km < 0 || pricePerLiter < 0) {
    throw new Error('No se aceptan valores negativos.');
  }
  const litersPerMonth = (monthlyKm * consumptionL100km) / 100;
  const monthlyFuelCost = litersPerMonth * pricePerLiter;
  const costPerKm = (consumptionL100km * pricePerLiter) / 100;
  return {
    litersPerMonth,
    monthlyFuelCost,
    costPerKm,
    annualFuelCost: monthlyFuelCost * 12,
  };
}

export type OwnershipInputs = {
  monthlyFuelCost: number | null;
  monthlyInsurance: number | null;
  annualTax: number | null;
  maintenanceProvision: number | null;
  monthlyParking: number;
  monthlyOther: number;
};

export type OwnershipResult = {
  monthlyTotal: number;
  annualScenario: number;
  breakdown: {
    fuel: number;
    insurance: number;
    taxProvision: number;
    maintenance: number;
    parking: number;
    other: number;
  };
};

export function maintenanceFromService(serviceCost: number, intervalMonths: number): number {
  if (!Number.isFinite(serviceCost) || serviceCost < 0) {
    throw new Error('El costo de service tiene que ser un número finito y no negativo.');
  }
  if (!Number.isFinite(intervalMonths) || intervalMonths <= 0) {
    throw new Error('El intervalo en meses tiene que ser un número finito mayor que cero.');
  }
  return serviceCost / intervalMonths;
}

export function calculateMonthlyOwnership(input: OwnershipInputs): OwnershipResult {
  const required = [
    input.monthlyFuelCost,
    input.monthlyInsurance,
    input.annualTax,
    input.maintenanceProvision,
  ];
  if (required.some((value) => value === null)) {
    throw new Error('Faltan componentes requeridos para un total completo.');
  }
  const fuel = input.monthlyFuelCost as number;
  const insurance = input.monthlyInsurance as number;
  const annualTax = input.annualTax as number;
  const maintenance = input.maintenanceProvision as number;
  const values = [fuel, insurance, annualTax, maintenance, input.monthlyParking, input.monthlyOther];
  if (!values.every((value) => Number.isFinite(value))) {
    throw new Error('Los valores tienen que ser números finitos.');
  }
  if (values.some((value) => value < 0)) {
    throw new Error('No se aceptan valores negativos.');
  }
  const taxProvision = annualTax / 12;
  const monthlyTotal =
    fuel + insurance + taxProvision + maintenance + input.monthlyParking + input.monthlyOther;
  return {
    monthlyTotal,
    annualScenario: monthlyTotal * 12,
    breakdown: {
      fuel,
      insurance,
      taxProvision,
      maintenance,
      parking: input.monthlyParking,
      other: input.monthlyOther,
    },
  };
}

/**
 * Argentine-aware decimal parser.
 * Accepts 1500,50 / 1.500,50 / 1500.50 / 1500.
 * Treats 1.500 as thousands (1500), not 1.5.
 */
export function parseArNumber(raw: string): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'blank' };
  }
  const normalized = trimmed.replace(/\s/g, '');
  if (!/^-?\d[\d.\.,]*$/.test(normalized)) {
    return { ok: false, error: 'invalid' };
  }

  let source = normalized;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(source)) {
    source = source.replace(/\./g, '').replace(',', '.');
  } else if (source.includes(',') && source.includes('.')) {
    return { ok: false, error: 'ambiguous' };
  } else if (source.includes(',')) {
    if ((source.match(/,/g) ?? []).length > 1) {
      return { ok: false, error: 'invalid' };
    }
    source = source.replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(source)) {
    source = source.replace(/\./g, '');
  } else if (source.includes('.')) {
    const fraction = source.split('.')[1] ?? '';
    if (fraction.length > 2) {
      return { ok: false, error: 'ambiguous' };
    }
  }

  const value = Number(source);
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'invalid' };
  }
  return { ok: true, value };
}
