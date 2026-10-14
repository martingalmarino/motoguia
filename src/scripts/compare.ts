import { MAX_COMPARE, onCompareChange, readCompare, toggleCompare } from './compare-store';

const toast = document.querySelector<HTMLElement>('[data-toast]');
let toastTimer: number | undefined;

function notify(html: string) {
  if (!toast) return;
  toast.innerHTML = html;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.innerHTML = '';
  }, 5000);
}

function sync(ids: string[]) {
  document.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach((button) => {
    const selected = ids.includes(button.dataset.compare ?? '');
    button.setAttribute('aria-pressed', String(selected));
    const label = button.querySelector('[data-compare-label]');
    if (label) label.textContent = selected ? button.dataset.labelOn ?? 'En comparador' : button.dataset.labelOff ?? 'Comparar';
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-compare]');
  if (!button) return;
  const id = button.dataset.compare;
  if (!id) return;
  const name = button.dataset.compareName ?? 'La moto';
  const result = toggleCompare(id);
  if (result.full) {
    notify(`Ya elegiste ${MAX_COMPARE} motos. Quitá una para sumar otra. <a href="/comparador/">Ir al comparador</a>`);
    return;
  }
  notify(
    result.added
      ? `${name} se sumó al comparador (${result.ids.length} de ${MAX_COMPARE}). <a href="/comparador/">Ver comparación</a>`
      : `${name} salió del comparador.`,
  );
});

onCompareChange(sync);
sync(readCompare());
