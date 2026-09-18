type Model = {
  id: string;
  name: string;
  href: string;
  engineType: string;
  category: string;
  displacementCc: number | null;
  power: number | null;
  powerUnit: string | null;
  transmission: string | null;
  brakesFront: string | null;
  brakesRear: string | null;
  abs: boolean | null;
  cbs: boolean | null;
  tankLiters: number | null;
  seatHeightMm: number | null;
  weightKg: number | null;
  weightBasis: string | null;
  rangeKm: number | null;
  priceMin: number | null;
};

const MAX = 3;
const data = JSON.parse(document.getElementById('compare-data')?.textContent ?? '[]') as Model[];
const byId = new Map(data.map((item) => [item.id, item]));

function label(value: string | number | boolean | null, extra?: string): string {
  if (value === null || value === undefined || value === '') return 'No informado';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return extra ? `${value} ${extra}` : String(value);
}

function readHash(): string[] {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  return (params.get('ids') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => byId.has(id))
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, MAX);
}

function writeHash(ids: string[]) {
  history.replaceState(null, '', ids.length ? `#ids=${ids.join(',')}` : location.pathname);
}

function render() {
  const ids = readHash();
  const models = ids.map((id) => byId.get(id)).filter((item): item is Model => Boolean(item));
  const chips = document.querySelector('[data-chips]');
  const table = document.querySelector('[data-compare-table]');
  if (!chips || !table) return;
  chips.innerHTML = models
    .map(
      (model) =>
        `<button class="chip" type="button" data-remove="${model.id}">Quitar ${model.name}</button>`,
    )
    .join('');
  const rows: [string, (model: Model) => string][] = [
    ['Modelo', (m) => `<a href="${m.href}">${m.name}</a>`],
    ['Categoría', (m) => m.category],
    ['Motor', (m) => (m.engineType === 'electric' ? 'Eléctrico' : 'Combustión')],
    ['Cilindrada', (m) => label(m.displacementCc, 'cm³')],
    ['Potencia declarada', (m) => label(m.power, m.powerUnit ?? '')],
    ['Transmisión', (m) => label(m.transmission)],
    ['Freno delantero', (m) => label(m.brakesFront)],
    ['Freno trasero', (m) => label(m.brakesRear)],
    ['ABS', (m) => label(m.abs)],
    ['CBS', (m) => label(m.cbs)],
    ['Tanque', (m) => label(m.tankLiters, 'l')],
    ['Asiento', (m) => label(m.seatHeightMm, 'mm')],
    ['Peso', (m) => (m.weightKg ? `${m.weightKg} kg (${m.weightBasis ?? 'base no aclarada'})` : 'No informado')],
    ['Autonomía declarada', (m) => label(m.rangeKm, 'km')],
  ];
  if (!models.length) {
    table.innerHTML = '';
    return;
  }
  table.innerHTML = `<thead><tr>${['<th class="sticky-col">Dato</th>', ...models.map((m) => `<th>${m.name}</th>`)].join('')}</tr></thead><tbody>${rows
    .map(([name, fn]) => {
      const cells = models.map(fn);
      const unique = new Set(cells.map((cell) => cell.replace(/<[^>]+>/g, '')));
      const mark = unique.size > 1 ? ' <span class="muted">(difiere)</span>' : '';
      return `<tr><th class="sticky-col">${name}${mark}</th>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;
    })
    .join('')}</tbody>`;
}

document.querySelector('[data-compare-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const id = String(new FormData(form).get('modelo') ?? '');
  const error = document.querySelector<HTMLElement>('[data-compare-error]');
  const ids = readHash();
  if (!id) return;
  if (ids.includes(id)) {
    if (error) {
      error.hidden = false;
      error.textContent = 'Ese modelo ya está en la comparación.';
    }
    return;
  }
  if (ids.length >= MAX) {
    if (error) {
      error.hidden = false;
      error.textContent = 'Como máximo se comparan tres fichas.';
    }
    return;
  }
  if (error) error.hidden = true;
  writeHash([...ids, id]);
  render();
});

document.querySelector('[data-chips]')?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const id = target.dataset.remove;
  if (!id) return;
  writeHash(readHash().filter((item) => item !== id));
  render();
});

render();
