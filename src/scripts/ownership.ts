import {
  calculateMonthlyOwnership,
  maintenanceFromService,
  parseArNumber,
} from '../lib/calculators';
import { formatArs } from '../lib/format';

const form = document.querySelector<HTMLFormElement>('[data-own-form]');
const out = document.querySelector<HTMLElement>('[data-own-result]');
const initialMessage = out?.innerHTML ?? '';

function req(raw: string) {
  const parsed = parseArNumber(raw);
  return parsed.ok ? parsed.value : null;
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
  const mode = form?.querySelector<HTMLInputElement>('input[name="maintMode"]:checked')?.value ?? 'monthly';
  form?.querySelectorAll<HTMLElement>('[data-maint]').forEach((block) => {
    block.hidden = block.dataset.maint !== mode;
  });
}

form?.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).name === 'maintMode') syncMode();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!out) return;
  const data = new FormData(form);
  let maintenance = req(String(data.get('maintMonthly') ?? ''));
  if (String(data.get('maintMode')) === 'service') {
    const cost = req(String(data.get('serviceCost') ?? ''));
    const every = req(String(data.get('serviceEvery') ?? ''));
    try {
      maintenance = cost === null || every === null ? null : maintenanceFromService(cost, every);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Revisá los datos del service.');
      return;
    }
  }
  try {
    const result = calculateMonthlyOwnership({
      monthlyFuelCost: req(String(data.get('fuel') ?? '')),
      monthlyInsurance: req(String(data.get('insurance') ?? '')),
      annualTax: req(String(data.get('tax') ?? '')),
      maintenanceProvision: maintenance,
      monthlyParking: req(String(data.get('parking') ?? '0')) ?? 0,
      monthlyOther: req(String(data.get('other') ?? '0')) ?? 0,
    });
    const rows: [string, number][] = [
      ['Combustible o energía', result.breakdown.fuel],
      ['Seguro', result.breakdown.insurance],
      ['Patente (anual ÷ 12)', result.breakdown.taxProvision],
      ['Mantenimiento', result.breakdown.maintenance],
      ['Cochera', result.breakdown.parking],
      ['Otros', result.breakdown.other],
    ];
    out.innerHTML = `
      <p>Total por mes</p>
      <p class="tool-result__total">${formatArs(result.monthlyTotal)}</p>
      <ul class="tool-result__rows">
        ${rows.map(([label, value]) => `<li><span>${label}</span><strong>${formatArs(value)}</strong></li>`).join('')}
        <li><span>Gasto anual (mismos valores)</span><strong>${formatArs(result.annualScenario)}</strong></li>
      </ul>`;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    showError(
      message.startsWith('Faltan')
        ? 'Completá combustible, seguro, patente y mantenimiento para calcular el total.'
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

syncMode();
