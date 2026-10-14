import { MAX_COMPARE, onCompareChange, readCompare, writeCompare } from './compare-store';

type Model = {
  id: string;
  name: string;
  href: string;
  image: { src: string; alt: string };
  rows: Record<string, string>;
  notes: Record<string, string>;
};

const raw = JSON.parse(document.getElementById('compare-data')?.textContent ?? '{}') as {
  rows?: [string, string][];
  models?: Model[];
};
const rowLabels = raw.rows ?? [];
const byId = new Map((raw.models ?? []).map((item) => [item.id, item]));

const form = document.querySelector<HTMLFormElement>('[data-compare-form]');
const select = form?.querySelector<HTMLSelectElement>('select');
const error = document.querySelector<HTMLElement>('[data-compare-error]');
const status = document.querySelector<HTMLElement>('[data-compare-status]');
const empty = document.querySelector<HTMLElement>('[data-compare-empty]');
const region = document.querySelector<HTMLElement>('[data-compare-region]');
const table = document.querySelector<HTMLTableElement>('[data-compare-table]');
const hint = document.querySelector<HTMLElement>('[data-compare-hint]');
const diffToggle = document.querySelector<HTMLElement>('[data-diff-toggle]');
const onlyDiff = document.querySelector<HTMLInputElement>('[data-only-diff]');

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function validIds(ids: string[]): string[] {
  return ids.filter((id, index) => byId.has(id) && ids.indexOf(id) === index).slice(0, MAX_COMPARE);
}

function idsFromHash(): string[] | null {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const value = params.get('ids');
  if (value === null) return null;
  return validIds(value.split(',').map((id) => id.trim()));
}

function syncHash(ids: string[]) {
  const next = ids.length ? `#ids=${ids.join(',')}` : '';
  if (location.hash !== next) history.replaceState(null, '', `${location.pathname}${next}`);
}

function showError(message: string | null) {
  if (!error) return;
  error.hidden = !message;
  error.textContent = message ?? '';
}

function headCell(model: Model): string {
  return `<th scope="col"><div class="compare-head">
    <img src="${escapeHtml(model.image.src)}" alt="${escapeHtml(model.image.alt)}" width="220" height="165" loading="lazy" decoding="async" />
    <a href="${escapeHtml(model.href)}">${escapeHtml(model.name)}</a>
    <button class="compare-remove" type="button" data-remove="${escapeHtml(model.id)}" aria-label="Quitar ${escapeHtml(model.name)} de la comparación">Quitar</button>
  </div></th>`;
}

function render() {
  const ids = validIds(readCompare());
  const models = ids.map((id) => byId.get(id)).filter((item): item is Model => Boolean(item));
  syncHash(ids);

  if (status) {
    status.textContent =
      models.length >= MAX_COMPARE
        ? 'Ya elegiste 3 motos. Quitá una para sumar otra.'
        : `Elegiste ${models.length} de ${MAX_COMPARE} motos.`;
  }
  if (select) {
    Array.from(select.options).forEach((option) => {
      if (option.value) option.disabled = ids.includes(option.value);
    });
  }

  if (empty) empty.hidden = models.length > 0;
  if (region) region.hidden = models.length === 0;
  if (hint) hint.hidden = models.length < 2;
  if (diffToggle) diffToggle.hidden = models.length < 2;
  if (!table) return;
  if (!models.length) {
    table.innerHTML = '';
    return;
  }

  const showOnlyDiff = Boolean(onlyDiff?.checked) && models.length > 1;
  const body = rowLabels
    .map(([key, label]) => {
      const values = models.map((model) => model.rows[key] ?? 'No informado');
      const differs = models.length > 1 && new Set(values).size > 1;
      if (showOnlyDiff && !differs) return '';
      const cells = models
        .map((model, index) => {
          const note = model.notes[key];
          return `<td>${escapeHtml(values[index])}${note ? `<span class="note">${escapeHtml(note)}</span>` : ''}</td>`;
        })
        .join('');
      const mark = differs ? '<span class="compare-diff">Difiere</span>' : '';
      return `<tr${differs ? ' class="is-diff"' : ''}><th scope="row" class="sticky-col">${escapeHtml(label)}${mark}</th>${cells}</tr>`;
    })
    .join('');

  table.innerHTML = `<caption class="visually-hidden">Comparación de ${models.map((m) => escapeHtml(m.name)).join(', ')}</caption>
    <thead><tr><th scope="col" class="sticky-col">Característica</th>${models.map(headCell).join('')}</tr></thead>
    <tbody>${body}</tbody>`;
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = select?.value ?? '';
  if (!id) {
    showError('Elegí un modelo de la lista.');
    select?.focus();
    return;
  }
  const ids = validIds(readCompare());
  if (ids.includes(id)) {
    showError('Esa moto ya está en la comparación.');
    return;
  }
  if (ids.length >= MAX_COMPARE) {
    showError('Ya elegiste 3 motos. Quitá una para sumar otra.');
    return;
  }
  showError(null);
  writeCompare([...ids, id]);
  if (select) select.value = '';
});

table?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-remove]');
  const id = button?.dataset.remove;
  if (!id) return;
  showError(null);
  writeCompare(readCompare().filter((item) => item !== id));
  select?.focus();
});

onlyDiff?.addEventListener('change', render);
onCompareChange(render);
window.addEventListener('hashchange', () => {
  const fromHash = idsFromHash();
  if (fromHash) writeCompare(fromHash);
});

const initial = idsFromHash();
if (initial && initial.length) writeCompare(initial);
render();
