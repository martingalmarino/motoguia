import { fold } from '../lib/format';

type State = {
  q: string;
  marca: string[];
  categoria: string[];
  motor: string[];
  cc: string;
  precio: string;
  orden: string;
};

type Group = 'marca' | 'categoria' | 'motor' | 'cc';

const LIST_KEYS = ['marca', 'categoria', 'motor'] as const;
const LABELS: Record<string, Record<string, string>> = {
  categoria: { cub: 'Cub', street: 'Street', scooter: 'Scooter', trail: 'Trail', adventure: 'Adventure', sport: 'Sport', touring: 'Touring', other: 'Otra' },
  motor: { combustion: 'Combustión', electric: 'Eléctrica' },
  cc: { '110': 'Hasta 115 cc', '150': 'De 116 a 150 cc' },
};

const form = document.querySelector<HTMLFormElement>('[data-filters]');
const catalog = document.querySelector<HTMLElement>('[data-catalog]');
const panel = document.querySelector<HTMLElement>('[data-filter-panel]');
const dialog = document.querySelector<HTMLElement>('[data-filter-dialog]');
const openButton = document.querySelector<HTMLButtonElement>('[data-filters-open]');
const drawerQuery = window.matchMedia('(max-width: 1023px)');
const cards = catalog ? [...catalog.querySelectorAll<HTMLElement>('[data-moto-card]')] : [];
const brandNames = new Map(
  [...document.querySelectorAll<HTMLInputElement>('input[name="marca"]')].map((input) => [
    input.value,
    input.parentElement?.textContent?.replace(/\d+/g, '').trim() ?? input.value,
  ]),
);

const emptyState = (): State => ({ q: '', marca: [], categoria: [], motor: [], cc: '', precio: '', orden: 'nombre' });

function splitList(value: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stateFromHash(): State {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  return {
    q: params.get('q') ?? '',
    marca: splitList(params.get('marca')),
    categoria: splitList(params.get('categoria')),
    motor: splitList(params.get('motor')),
    cc: params.get('cc') ?? '',
    precio: params.get('precio') ?? '',
    orden: params.get('orden') ?? 'nombre',
  };
}

function hashFromState(state: State): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set('q', state.q.trim());
  for (const key of LIST_KEYS) if (state[key].length) params.set(key, state[key].join(','));
  if (state.cc) params.set('cc', state.cc);
  if (state.precio.trim()) params.set('precio', state.precio.trim());
  if (state.orden && state.orden !== 'nombre') params.set('orden', state.orden);
  return params.toString().replace(/%2C/g, ',');
}

function readForm(): State {
  if (!form) return emptyState();
  const data = new FormData(form);
  return {
    q: String(data.get('q') ?? ''),
    marca: data.getAll('marca').map(String),
    categoria: data.getAll('categoria').map(String),
    motor: data.getAll('motor').map(String),
    cc: String(data.get('cc') ?? ''),
    precio: String(data.get('precio') ?? ''),
    orden: String(data.get('orden') ?? 'nombre'),
  };
}

function writeForm(state: State) {
  if (!form) return;
  form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
    const key = input.name as (typeof LIST_KEYS)[number];
    input.checked = Array.isArray(state[key]) && state[key].includes(input.value);
  });
  form.querySelectorAll<HTMLInputElement>('input[name="cc"]').forEach((input) => {
    input.checked = input.value === state.cc;
  });
  const q = form.elements.namedItem('q');
  if (q instanceof HTMLInputElement && document.activeElement !== q) q.value = state.q;
  const precio = form.elements.namedItem('precio');
  if (precio instanceof HTMLInputElement) precio.value = state.precio;
  const orden = form.elements.namedItem('orden');
  if (orden instanceof HTMLSelectElement) orden.value = state.orden || 'nombre';
}

function matchesQuery(haystack: string, query: string): boolean {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = fold(haystack);
  return tokens.every((token) => hay.includes(token));
}

function matches(card: HTMLElement, state: State, skip?: Group): boolean {
  const d = card.dataset;
  if (!matchesQuery(`${d.search ?? ''} ${d.name ?? ''}`, state.q)) return false;
  if (skip !== 'marca' && state.marca.length && !state.marca.includes(d.brand ?? '')) return false;
  if (skip !== 'categoria' && state.categoria.length && !state.categoria.includes(d.category ?? '')) return false;
  if (skip !== 'motor' && state.motor.length && !state.motor.includes(d.engine ?? '')) return false;
  if (skip !== 'cc' && state.cc) {
    const cc = d.cc ? Number(d.cc) : null;
    if (d.engine !== 'combustion' || cc === null) return false;
    if (state.cc === '110' && cc > 115) return false;
    if (state.cc === '150' && (cc <= 115 || cc > 150)) return false;
  }
  const max = state.precio.trim() ? Number(state.precio) : null;
  if (max !== null && !Number.isNaN(max)) {
    const price = d.price ? Number(d.price) : null;
    if (price === null || price > max) return false;
  }
  return true;
}

function countFor(state: State) {
  return cards.filter((card) => matches(card, state)).length;
}

function plural(n: number) {
  return `${n.toLocaleString('es-AR')} ${n === 1 ? 'modelo' : 'modelos'}`;
}

function updateFacets(state: State) {
  document.querySelectorAll<HTMLElement>('[data-facet]').forEach((node) => {
    const [group, value] = (node.dataset.facet ?? '').split(':') as [Group, string];
    const n = cards.filter((card) => {
      if (!matches(card, state, group)) return false;
      const d = card.dataset;
      if (group === 'marca') return d.brand === value;
      if (group === 'categoria') return d.category === value;
      if (group === 'motor') return d.engine === value;
      const cc = d.cc ? Number(d.cc) : null;
      if (d.engine !== 'combustion' || cc === null) return false;
      return value === '110' ? cc <= 115 : cc > 115 && cc <= 150;
    }).length;
    node.textContent = String(n);
    node.closest('.filter-option')?.classList.toggle('is-empty', n === 0);
  });
  const note = document.querySelector<HTMLElement>('[data-budget-note]');
  if (note) note.hidden = !state.precio.trim();
}

function activeCount(state: State) {
  return state.marca.length + state.categoria.length + state.motor.length + (state.cc ? 1 : 0) + (state.precio.trim() ? 1 : 0);
}

function renderChips(state: State) {
  const box = document.querySelector<HTMLElement>('[data-active-filters]');
  if (!box) return;
  const chips: { key: string; value: string; label: string }[] = [];
  if (state.q.trim()) chips.push({ key: 'q', value: state.q, label: `“${state.q.trim()}”` });
  state.marca.forEach((value) => chips.push({ key: 'marca', value, label: brandNames.get(value) ?? value }));
  state.categoria.forEach((value) => chips.push({ key: 'categoria', value, label: LABELS.categoria[value] ?? value }));
  state.motor.forEach((value) => chips.push({ key: 'motor', value, label: LABELS.motor[value] ?? value }));
  if (state.cc) chips.push({ key: 'cc', value: state.cc, label: LABELS.cc[state.cc] ?? state.cc });
  if (state.precio.trim()) {
    const n = Number(state.precio);
    chips.push({ key: 'precio', value: state.precio, label: `Hasta ${Number.isNaN(n) ? state.precio : `$ ${n.toLocaleString('es-AR')}`}` });
  }
  box.hidden = chips.length === 0;
  box.replaceChildren(
    ...chips.map((chip) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.dataset.removeKey = chip.key;
      button.dataset.removeValue = chip.value;
      button.setAttribute('aria-label', `Quitar filtro ${chip.label}`);
      button.innerHTML = `<span></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
      button.querySelector('span')!.textContent = chip.label;
      return button;
    }),
  );
  if (chips.length > 1) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'chip chip--clear';
    clear.dataset.clear = '';
    clear.textContent = 'Limpiar todo';
    box.append(clear);
  }
}

function render(state: State) {
  if (!catalog) return;
  const scored = cards.map((card) => ({
    card,
    show: matches(card, state),
    price: card.dataset.price ? Number(card.dataset.price) : null,
    name: card.dataset.name ?? '',
  }));
  scored.sort((a, b) => {
    if (state.orden === 'precio-asc' || state.orden === 'precio-desc') {
      if (a.price === null && b.price === null) return a.name.localeCompare(b.name, 'es');
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return state.orden === 'precio-asc' ? a.price - b.price : b.price - a.price;
    }
    return a.name.localeCompare(b.name, 'es');
  });
  const fragment = document.createDocumentFragment();
  let visible = 0;
  for (const item of scored) {
    item.card.hidden = !item.show;
    item.card.classList.toggle('is-hidden', !item.show);
    if (item.show) visible += 1;
    fragment.append(item.card);
  }
  catalog.append(fragment);

  const count = document.querySelector('[data-count]');
  if (count) count.textContent = plural(visible);
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
  const badge = document.querySelector<HTMLElement>('[data-active-count]');
  const active = activeCount(state);
  if (badge) {
    badge.hidden = active === 0;
    badge.textContent = String(active);
  }
  renderChips(state);
  updateFacets(state);
  updatePreview(state);
}

function updatePreview(state: State) {
  const preview = document.querySelector('[data-preview-count]');
  if (preview) preview.textContent = countFor(state).toLocaleString('es-AR');
  const apply = document.querySelector('[data-filters-apply]');
  const n = countFor(state);
  if (apply) apply.setAttribute('aria-label', `Ver ${n} ${n === 1 ? 'resultado' : 'resultados'}`);
}

function commit(state: State) {
  const hash = hashFromState(state);
  history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
  writeForm(state);
  render(state);
}

/* ---------- Drawer ---------- */

let lastTrigger: HTMLElement | null = null;
const isDrawer = () => drawerQuery.matches;
const isOpen = () => panel?.classList.contains('is-open') ?? false;

function focusables(): HTMLElement[] {
  if (!dialog) return [];
  return [...dialog.querySelectorAll<HTMLElement>('button, summary, input, select, a[href]')].filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}

function openDrawer() {
  if (!panel || !dialog) return;
  lastTrigger = document.activeElement as HTMLElement | null;
  panel.classList.add('is-open');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  openButton?.setAttribute('aria-expanded', 'true');
  document.documentElement.classList.add('has-dialog');
  updatePreview(readForm());
  dialog.querySelector<HTMLElement>('[data-filters-close]')?.focus();
}

function closeDrawer(discard: boolean) {
  if (!panel || !dialog || !isOpen()) return;
  panel.classList.remove('is-open');
  dialog.removeAttribute('role');
  dialog.removeAttribute('aria-modal');
  openButton?.setAttribute('aria-expanded', 'false');
  document.documentElement.classList.remove('has-dialog');
  if (discard) {
    const current = stateFromHash();
    writeForm(current);
    updateFacets(current);
  }
  (lastTrigger ?? openButton)?.focus();
}

openButton?.addEventListener('click', openDrawer);
document.querySelector('[data-filters-close]')?.addEventListener('click', () => closeDrawer(true));
document.querySelector('[data-filters-apply]')?.addEventListener('click', () => {
  commit(readForm());
  closeDrawer(false);
  document.getElementById('resultados')?.scrollIntoView({ block: 'start' });
});
panel?.addEventListener('click', (event) => {
  if (event.target === panel) closeDrawer(true);
});
document.addEventListener('keydown', (event) => {
  if (!isOpen()) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer(true);
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
drawerQuery.addEventListener('change', () => {
  if (!isDrawer() && isOpen()) closeDrawer(true);
});

/* ---------- Form events ---------- */

let debounce: number | undefined;

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  window.clearTimeout(debounce);
  const draft = readForm();
  commit(isDrawer() ? { ...stateFromHash(), q: draft.q, orden: draft.orden } : draft);
});

form?.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name === 'q') {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const draft = readForm();
      commit(isDrawer() ? { ...stateFromHash(), q: draft.q } : draft);
    }, 160);
    return;
  }
  if (target.name === 'precio') {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      if (isDrawer() && isOpen()) {
        updateFacets(readForm());
        updatePreview(readForm());
      } else commit(readForm());
    }, 300);
  }
});

form?.addEventListener('change', (event) => {
  const target = event.target as HTMLElement;
  if (target instanceof HTMLInputElement && (target.name === 'q' || target.name === 'precio')) return;
  if (target instanceof HTMLSelectElement && target.name === 'orden') {
    commit({ ...stateFromHash(), orden: target.value });
    return;
  }
  if (isDrawer() && isOpen()) {
    const draft = readForm();
    updateFacets(draft);
    updatePreview(draft);
    return;
  }
  commit(readForm());
});

document.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-clear], [data-remove-key]');
  if (!target || !form?.contains(target)) return;
  if (target.hasAttribute('data-clear')) {
    if (isDrawer() && isOpen() && dialog?.contains(target)) {
      const current = stateFromHash();
      const draft = { ...emptyState(), q: current.q, orden: current.orden };
      writeForm(draft);
      updateFacets(draft);
      updatePreview(draft);
      return;
    }
    commit({ ...emptyState(), orden: stateFromHash().orden });
    const q = form.elements.namedItem('q');
    if (q instanceof HTMLInputElement) q.value = '';
    return;
  }
  const key = target.dataset.removeKey as keyof State;
  const value = target.dataset.removeValue ?? '';
  const state = stateFromHash();
  if (key === 'marca' || key === 'categoria' || key === 'motor') state[key] = state[key].filter((item) => item !== value);
  else if (key === 'q' || key === 'cc' || key === 'precio') state[key] = '';
  if (key === 'q') {
    const q = form.elements.namedItem('q');
    if (q instanceof HTMLInputElement) q.value = '';
  }
  commit(state);
});

window.addEventListener('hashchange', () => {
  const state = stateFromHash();
  const q = form?.elements.namedItem('q');
  if (q instanceof HTMLInputElement) q.value = state.q;
  writeForm(state);
  render(state);
});

/* ---------- Init ---------- */

const searchQ = new URLSearchParams(location.search).get('q');
if (searchQ !== null) {
  const state = stateFromHash();
  if (!state.q) state.q = searchQ;
  const hash = hashFromState(state);
  history.replaceState(null, '', `${location.pathname}${hash ? `#${hash}` : ''}`);
}

const initial = stateFromHash();
const qInput = form?.elements.namedItem('q');
if (qInput instanceof HTMLInputElement) qInput.value = initial.q;
writeForm(initial);
render(initial);
