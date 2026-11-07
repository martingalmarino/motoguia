import { onCompareChange, readCompare } from './compare-store';

const triggers = new WeakMap<HTMLDialogElement, HTMLElement | null>();

function setExpanded(trigger: HTMLElement | null | undefined, open: boolean) {
  if (trigger?.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function openDialog(dialog: HTMLDialogElement, trigger: HTMLElement | null, focusTarget?: HTMLElement | null) {
  if (dialog.open) return;
  triggers.set(dialog, trigger);
  dialog.showModal();
  document.documentElement.classList.add('has-dialog');
  setExpanded(trigger, true);
  focusTarget?.focus();
}

document.querySelectorAll<HTMLDialogElement>('dialog.search-dialog, dialog.nav-drawer').forEach((dialog) => {
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-dialog');
    const trigger = triggers.get(dialog);
    setExpanded(trigger, false);
    trigger?.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
});

const searchDialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
document.querySelectorAll<HTMLElement>('[data-search-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!searchDialog) return;
    openDialog(searchDialog, button, searchDialog.querySelector<HTMLInputElement>('input[type="search"]'));
  });
});

const drawer = document.querySelector<HTMLDialogElement>('[data-nav-drawer]');
document.querySelectorAll<HTMLElement>('[data-drawer-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!drawer) return;
    openDialog(drawer, button, drawer.querySelector<HTMLElement>('[data-dialog-close]'));
  });
});
drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => drawer.close()));

const subnavs = [...document.querySelectorAll<HTMLElement>('[data-subnav]')];
function closeSubnavs(except?: HTMLElement) {
  subnavs.forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    item.querySelector('[data-subnav-toggle]')?.setAttribute('aria-expanded', 'false');
  });
}
subnavs.forEach((item) => {
  const toggle = item.querySelector<HTMLButtonElement>('[data-subnav-toggle]');
  const setOpen = (open: boolean) => {
    item.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };
  toggle?.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    closeSubnavs(item);
    setOpen(open);
    if (!open && item.matches(':hover')) toggle?.setAttribute('aria-expanded', 'true');
  });
  item.addEventListener('mouseenter', () => {
    toggle?.setAttribute('aria-expanded', 'true');
  });
  item.addEventListener('mouseleave', () => {
    if (item.classList.contains('is-open') || item.contains(document.activeElement)) return;
    toggle?.setAttribute('aria-expanded', 'false');
  });
  item.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && item.contains(next)) return;
    item.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', item.matches(':hover') ? 'true' : 'false');
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = subnavs.find((item) => item.classList.contains('is-open'));
  if (!open) return;
  closeSubnavs();
  open.querySelector<HTMLButtonElement>('[data-subnav-toggle]')?.focus();
});
document.addEventListener('click', (event) => {
  const target = event.target as Node;
  if (!subnavs.some((item) => item.contains(target))) closeSubnavs();
});

function renderCount(ids: string[]) {
  const count = ids.length;
  document.querySelectorAll<HTMLElement>('[data-compare-link]').forEach((link) => {
    link.hidden = count === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-compare-count]').forEach((node) => {
    node.textContent = String(count);
    node.setAttribute('aria-label', `${count} ${count === 1 ? 'modelo elegido' : 'modelos elegidos'}`);
  });
  document.querySelectorAll<HTMLElement>('[data-compare-count-drawer]').forEach((node) => {
    node.hidden = count === 0;
    node.textContent = String(count);
  });
}
renderCount(readCompare());
onCompareChange(renderCount);

document.querySelectorAll<HTMLFormElement>('[data-model-search]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = String(new FormData(form).get('q') ?? '').trim();
    const target = `/motos/${q ? `#q=${encodeURIComponent(q)}` : ''}`;
    searchDialog?.open && searchDialog.close();
    if (location.pathname === '/motos/') {
      if (q) location.hash = `q=${encodeURIComponent(q)}`;
      else history.replaceState(null, '', '/motos/');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      document.getElementById('resultados')?.scrollIntoView({ block: 'start' });
      return;
    }
    location.href = target;
  });
});
