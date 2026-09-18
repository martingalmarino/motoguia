import { fold } from '../lib/format';

function parseHash(hash: string): URLSearchParams {
  return new URLSearchParams(hash.replace(/^#/, ''));
}

function apply() {
  const form = document.querySelector<HTMLFormElement>('[data-filters]');
  const catalog = document.querySelector('[data-catalog]');
  if (!form || !catalog) return;

  const cards = [...catalog.querySelectorAll<HTMLElement>('[data-moto-card]')];
  const params = parseHash(location.hash);
  const q = params.get('q') ?? '';
  const marca = params.get('marca') ?? '';
  const categoria = params.get('categoria') ?? '';
  const motor = params.get('motor') ?? '';
  const cc = params.get('cc') ?? '';
  const precio = params.get('precio');
  const orden = params.get('orden') ?? 'nombre';

  for (const [name, value] of Object.entries({ q, marca, categoria, motor, cc, precio: precio ?? '', orden })) {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = value;
  }

  const maxPrice = precio ? Number(precio) : null;
  const scored = cards.map((card) => {
    const name = card.dataset.name ?? '';
    const brand = card.dataset.brand ?? '';
    const category = card.dataset.category ?? '';
    const engine = card.dataset.engine ?? '';
    const displacement = card.dataset.cc ? Number(card.dataset.cc) : null;
    const price = card.dataset.price ? Number(card.dataset.price) : null;
    const matchesQ = !q || fold(name).includes(fold(q));
    const matchesBrand = !marca || brand === marca;
    const matchesCat = !categoria || category === categoria;
    const matchesEngine = !motor || engine === motor;
    let matchesCc = true;
    if (cc) {
      if (engine !== 'combustion' || displacement === null) matchesCc = false;
      else matchesCc = cc === '110' ? displacement <= 115 : displacement > 115 && displacement <= 150;
    }
    const matchesPrice = maxPrice === null || Number.isNaN(maxPrice) || (price !== null && price <= maxPrice);
    const show = matchesQ && matchesBrand && matchesCat && matchesEngine && matchesCc && matchesPrice;
    return { card, show, price, name };
  });

  scored.sort((a, b) => {
    if (orden === 'precio-asc' || orden === 'precio-desc') {
      const av = a.price ?? Number.POSITIVE_INFINITY;
      const bv = b.price ?? Number.POSITIVE_INFINITY;
      return orden === 'precio-asc' ? av - bv : bv - av;
    }
    return a.name.localeCompare(b.name, 'es');
  });

  const fragment = document.createDocumentFragment();
  let visible = 0;
  for (const item of scored) {
    item.card.hidden = !item.show;
    if (item.show) visible += 1;
    fragment.append(item.card);
  }
  catalog.append(fragment);

  const count = document.querySelector('[data-count]');
  if (count) count.textContent = `${visible} ficha${visible === 1 ? '' : 's'}`;
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
}

function writeHash(form: HTMLFormElement) {
  const data = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, value] of data.entries()) {
    if (String(value).trim()) params.set(key, String(value).trim());
  }
  const next = params.toString();
  const url = next ? `#${next}` : `${location.pathname}${location.search}`;
  history.replaceState(null, '', url);
  apply();
}

const form = document.querySelector<HTMLFormElement>('[data-filters]');
let debounce: number | undefined;

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  writeHash(form);
});

form?.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  window.clearTimeout(debounce);
  debounce = window.setTimeout(() => writeHash(form), 160);
});

form?.addEventListener('change', () => {
  window.clearTimeout(debounce);
  writeHash(form);
});

form?.addEventListener('reset', () => {
  window.clearTimeout(debounce);
  queueMicrotask(() => {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    apply();
  });
});

window.addEventListener('hashchange', apply);

const extra = document.querySelector<HTMLDetailsElement>('.catalog-filters');
const wide = window.matchMedia('(min-width: 768px)');
function syncFiltersOpen() {
  if (extra) extra.open = wide.matches;
}
wide.addEventListener('change', syncFiltersOpen);
syncFiltersOpen();

apply();
