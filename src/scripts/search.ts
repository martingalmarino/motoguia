import { fold } from '../lib/format';

type Item = { title: string; url: string; summary: string };
const items = JSON.parse(document.getElementById('search-index')?.textContent ?? '[]') as Item[];
const list = document.querySelector('[data-search-results]');
const form = document.querySelector<HTMLFormElement>('[data-search-form]');

function run(q: string) {
  if (!list) return;
  const needle = fold(q);
  const hits = needle ? items.filter((item) => fold(`${item.title} ${item.summary}`).includes(needle)) : items.slice(0, 12);
  list.innerHTML = hits
    .slice(0, 30)
    .map((item) => `<li><a href="${item.url}">${item.title}</a><p class="muted">${item.summary}</p></li>`)
    .join('') || '<li>No hay resultados en el índice publicado.</li>';
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

run(new URLSearchParams(location.search).get('q') ?? '');
const input = form?.elements.namedItem('q');
if (input instanceof HTMLInputElement) input.value = new URLSearchParams(location.search).get('q') ?? '';
