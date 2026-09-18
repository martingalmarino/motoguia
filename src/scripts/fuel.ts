import { calculateFuelCost, consumptionFromKmPerLiter, parseArNumber } from '../lib/calculators';
import { formatArs } from '../lib/format';

const form = document.querySelector<HTMLFormElement>('[data-fuel-form]');
const out = document.querySelector('[data-fuel-result]');

function field(name: string): HTMLInputElement | HTMLSelectElement | null {
  const el = form?.elements.namedItem(name);
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el : null;
}

function num(raw: string) {
  const parsed = parseArNumber(raw);
  return parsed.ok ? parsed.value : null;
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!out) return;
  const data = new FormData(form);
  const modo = String(data.get('modo'));
  let monthlyKm: number | null = null;
  if (modo === 'dia') {
    const kmDia = num(String(data.get('kmDia') ?? ''));
    const dias = num(String(data.get('dias') ?? ''));
    if (kmDia === null || dias === null) {
      out.textContent = 'Completá km por día y días de uso, o pasate a km al mes.';
      return;
    }
    monthlyKm = kmDia * dias;
  } else {
    monthlyKm = num(String(data.get('kmMes') ?? ''));
  }
  let consumption = num(String(data.get('consumo') ?? ''));
  if (String(data.get('unidad')) === 'kml' && consumption !== null) {
    try {
      consumption = consumptionFromKmPerLiter(consumption);
    } catch (error) {
      out.textContent = error instanceof Error ? error.message : 'Consumo inválido';
      return;
    }
  }
  const price = num(String(data.get('precio') ?? ''));
  try {
    const result = calculateFuelCost({ monthlyKm, consumptionL100km: consumption, pricePerLiter: price });
    out.textContent = `Litros al mes: ${result.litersPerMonth.toLocaleString('es-AR', { maximumFractionDigits: 2 })}. Costo mensual: ${formatArs(result.monthlyFuelCost)}. Costo por km: ${result.costPerKm.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ARS. Escenario anual a precio constante: ${formatArs(result.annualFuelCost)}.`;
  } catch (error) {
    out.textContent = error instanceof Error ? error.message : 'No se pudo calcular';
  }
});

form?.querySelector('[data-example]')?.addEventListener('click', () => {
  const kmMes = field('kmMes');
  const consumo = field('consumo');
  const unidad = field('unidad');
  const precio = field('precio');
  if (kmMes) kmMes.value = '1000';
  if (consumo) consumo.value = '2,5';
  if (unidad) unidad.value = 'l100';
  if (precio) precio.value = '1500';
  const mes = form.querySelector<HTMLInputElement>('input[name="modo"][value="mes"]');
  if (mes) mes.checked = true;
});

field('moto')?.addEventListener('change', (event) => {
  const value = (event.currentTarget as HTMLSelectElement).value;
  const consumo = field('consumo');
  if (value && consumo) consumo.value = value.replace('.', ',');
});
