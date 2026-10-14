import { calculateFuelCost, consumptionFromKmPerLiter, parseArNumber } from '../lib/calculators';
import { formatArs } from '../lib/format';

const form = document.querySelector<HTMLFormElement>('[data-fuel-form]');
const out = document.querySelector<HTMLElement>('[data-fuel-result]');
const initialMessage = out?.innerHTML ?? '';

function field(name: string): HTMLInputElement | HTMLSelectElement | null {
  const el = form?.elements.namedItem(name);
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el : null;
}

function num(raw: string) {
  const parsed = parseArNumber(raw);
  return parsed.ok ? parsed.value : null;
}

function decimal(value: number) {
  return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

function showError(message: string) {
  if (!out) return;
  out.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'tool-result__error';
  p.textContent = message;
  out.append(p);
}

function syncMode() {
  const mode = form?.querySelector<HTMLInputElement>('input[name="modo"]:checked')?.value ?? 'mes';
  form?.querySelectorAll<HTMLElement>('[data-mode]').forEach((block) => {
    block.hidden = block.dataset.mode !== mode;
  });
}

form?.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).name === 'modo') syncMode();
});

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
      showError('Completá los kilómetros por día y los días de uso por mes.');
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
    } catch {
      showError('El consumo en kilómetros por litro tiene que ser mayor que cero.');
      return;
    }
  }
  const price = num(String(data.get('precio') ?? ''));
  try {
    const result = calculateFuelCost({ monthlyKm, consumptionL100km: consumption, pricePerLiter: price });
    out.innerHTML = `
      <p>Gasto mensual en combustible</p>
      <p class="tool-result__total">${formatArs(result.monthlyFuelCost)}</p>
      <ul class="tool-result__rows">
        <li><span>Litros por mes</span><strong>${decimal(result.litersPerMonth)} l</strong></li>
        <li><span>Costo por kilómetro</span><strong>$ ${decimal(result.costPerKm)}</strong></li>
        <li><span>Gasto anual (mismo precio)</span><strong>${formatArs(result.annualFuelCost)}</strong></li>
      </ul>`;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    showError(
      message.startsWith('Faltan')
        ? 'Completá kilómetros, consumo y precio por litro para calcular.'
        : message || 'Revisá los valores cargados.',
    );
  }
});

form?.addEventListener('reset', () => {
  window.setTimeout(() => {
    syncMode();
    if (out) out.innerHTML = initialMessage;
  });
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
  syncMode();
  form.requestSubmit();
});

field('moto')?.addEventListener('change', (event) => {
  const value = (event.currentTarget as HTMLSelectElement).value;
  const consumo = field('consumo');
  const unidad = field('unidad');
  if (value && consumo) consumo.value = value.replace('.', ',');
  if (value && unidad) unidad.value = 'l100';
});

syncMode();
