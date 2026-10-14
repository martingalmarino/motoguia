import { fold } from '../lib/format';

type Item = { type: string; title: string; url: string; summary: string };
const items = JSON.parse(document.getElementById('search-index')?.textContent ?? '[]') as Item[];
const list = document.querySelector<HTMLElement>('[data-search-results]');
const heading = document.querySelector<HTMLElement>('[data-search-heading]');
const form = document.querySelector<HTMLFormElement>('[data-search-form]');

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function run(q: string) {
  if (!list) return;
  const needle = fold(q.trim());
  const hits = needle ? items.filter((item) => fold(`${item.title} ${item.summary}`).includes(needle)) : items.slice(0, 12);
  if (heading) {
    heading.textContent = needle
      ? `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'} para “${q.trim()}”`
      : 'Contenido destacado';
  }
  list.innerHTML =
    hits
      .slice(0, 30)
      .map(
        (item) =>
          `<li><span class="search-results__type">${escapeHtml(item.type)}</span><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a><p>${escapeHtml(item.summary)}</p></li>`,
      )
      .join('') ||
    '<li><p>No encontramos resultados. Probá con otra palabra o <a href="/motos/">mirá el catálogo completo</a>.</p></li>';
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const q = String(new FormData(form).get('q') ?? '');
  const params = new URLSearchParams(location.search);
  if (q) params.set('q', q);
  else params.delete('q');
  history.replaceState(null, '', `${location.pathname}${params.toString() ? `?${params}` : ''}`);
  run(q);
});

const initial = new URLSearchParams(location.search).get('q') ?? '';
const input = form?.elements.namedItem('q');
if (input instanceof HTMLInputElement) input.value = initial;
run(initial);
