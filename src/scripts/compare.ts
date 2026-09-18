const KEY = 'motoguia-compare';
const MAX = 3;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private mode */
  }
}

export function add(id: string) {
  const ids = read();
  if (ids.includes(id)) return ids;
  if (ids.length >= MAX) return ids;
  const next = [...ids, id];
  write(next);
  return next;
}

export function remove(id: string) {
  const next = read().filter((item) => item !== id);
  write(next);
  return next;
}

document.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.compare;
    if (!id) return;
    const ids = add(id);
    button.textContent = ids.includes(id) ? 'En comparador' : 'Comparar';
  });
});
