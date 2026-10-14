const KEY = 'motoguia-compare';
export const MAX_COMPARE = 3;
export const COMPARE_EVENT = 'motoguia:compare';

export function readCompare(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

export function writeCompare(ids: string[]) {
  const next = ids.filter((id, index) => ids.indexOf(id) === index).slice(0, MAX_COMPARE);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* almacenamiento no disponible: el estado vive solo en esta página */
  }
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT, { detail: next }));
  return next;
}

export function toggleCompare(id: string): { ids: string[]; added: boolean; full: boolean } {
  const ids = readCompare();
  if (ids.includes(id)) return { ids: writeCompare(ids.filter((item) => item !== id)), added: false, full: false };
  if (ids.length >= MAX_COMPARE) return { ids, added: false, full: true };
  return { ids: writeCompare([...ids, id]), added: true, full: false };
}

export function onCompareChange(callback: (ids: string[]) => void) {
  window.addEventListener(COMPARE_EVENT, (event) => callback((event as CustomEvent<string[]>).detail));
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) callback(readCompare());
  });
}
