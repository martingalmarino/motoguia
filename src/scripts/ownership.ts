import {
  calculateMonthlyOwnership,
  maintenanceFromService,
  parseArNumber,
} from '../lib/calculators';
import { formatArs } from '../lib/format';

const form = document.querySelector<HTMLFormElement>('[data-own-form]');
const out = document.querySelector('[data-own-result]');

function req(raw: string) {
  const parsed = parseArNumber(raw);
  return parsed.ok ? parsed.value : null;
}

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
      out.textContent = error instanceof Error ? error.message : 'Mantenimiento inválido';
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
    out.innerHTML = `<p>Total mensual: <strong>${formatArs(result.monthlyTotal)}</strong>. Escenario anual a precios constantes: ${formatArs(result.annualScenario)}.</p><ul><li>Combustible o energía: ${formatArs(result.breakdown.fuel)}</li><li>Seguro: ${formatArs(result.breakdown.insurance)}</li><li>Patente prorrateada: ${formatArs(result.breakdown.taxProvision)}</li><li>Mantenimiento: ${formatArs(result.breakdown.maintenance)}</li><li>Cochera: ${formatArs(result.breakdown.parking)}</li><li>Otros: ${formatArs(result.breakdown.other)}</li></ul>`;
  } catch (error) {
    out.textContent = error instanceof Error ? error.message : 'No se pudo calcular';
  }
});
