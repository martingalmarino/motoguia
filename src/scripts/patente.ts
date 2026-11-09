import {
  DNRPA_VALUATION_CITE,
  DNRPA_VALUATION_URL,
  FISCAL_YEAR,
  calculatePatent,
  roundPesos,
  type PatentInput,
  type PatentLine,
  type PatentResult,
} from '../lib/calculators/patente';
import { formatArs } from '../lib/format';
import { isBrandFile, isBrandIndex, tipoLabel, type BrandFile, type ModelRecord } from '../lib/valuacion/dnrpa';

const form = document.querySelector<HTMLFormElement>('#pt-form');
if (form) init(form);

function init(root: HTMLFormElement) {
  const byId = <T extends HTMLElement>(id: string): T => {
    const node = document.getElementById(id);
    if (!node) throw new Error('No se pudo iniciar la calculadora.');
    return node as T;
  };
  const marca = byId<HTMLSelectElement>('pt-marca');
  const modelo = byId<HTMLSelectElement>('pt-modelo');
  const anioElegir = byId<HTMLSelectElement>('pt-anio-elegir');
  const ccElegir = byId<HTMLInputElement>('pt-cc-elegir');
  const jur = byId<HTMLSelectElement>('pt-jur');
  const val = byId<HTMLInputElement>('pt-val');
  const anio = byId<HTMLInputElement>('pt-anio');
  const cc = byId<HTMLInputElement>('pt-cc');
  const result = byId<HTMLElement>('pt-result');
  const valBox = byId<HTMLElement>('pt-val-box');
  const aviso = byId<HTMLTemplateElement>('pt-aviso-tpl');
  const base = root.dataset.brandBase ?? '/data/valuacion-dnrpa/';
  const indexUrl = root.dataset.brands ?? '/data/valuacion-dnrpa/index.json';

  const brandFiles = new Map<string, BrandFile>();
  let brandsTask: Promise<void> | null = null;
  let brandRequest = 0;
  let currentFile: BrandFile | null = null;

  function mode() {
    return root.querySelector<HTMLInputElement>('input[name="pt-mode"]:checked')?.value ?? 'elegir';
  }

  function syncMode() {
    const manual = mode() === 'manual';
    const elegir = byId<HTMLElement>('pt-elegir');
    const manualBox = byId<HTMLElement>('pt-manual');
    if (elegir) elegir.hidden = manual;
    if (manualBox) manualBox.hidden = !manual;
    if (manual) valBox.hidden = true;
  }

  function setField(id: string, bad: boolean, message = '') {
    const control = document.getElementById(id);
    const field = control?.closest<HTMLElement>('.pt-field');
    if (!field || !control) return;
    field.classList.toggle('is-bad', bad);
    const error = field.querySelector<HTMLElement>('.pt-err');
    if (error && message) error.textContent = message;
    control.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function clearErrors() {
    root.querySelectorAll<HTMLElement>('.pt-field.is-bad').forEach((field) => field.classList.remove('is-bad'));
    root.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((control) => control.setAttribute('aria-invalid', 'false'));
  }

  function placeholder(select: HTMLSelectElement, label: string) {
    select.replaceChildren(new Option(label, ''));
  }

  async function ensureBrands() {
    if (!brandsTask) {
      const task = (async () => {
        marca.setAttribute('aria-busy', 'true');
        const response = await fetch(indexUrl);
        if (!response.ok) throw new Error('marcas');
        const data: unknown = await response.json();
        if (!isBrandIndex(data)) throw new Error('marcas');
        const selected = marca.value;
        placeholder(marca, 'Elegí una marca');
        for (const item of data.marcas) marca.add(new Option(item.n, item.s));
        if (selected) marca.value = selected;
        setField('pt-marca', false);
      })();
      brandsTask = task.then(
        () => {
          marca.removeAttribute('aria-busy');
        },
        (error: unknown) => {
          brandsTask = null;
          marca.removeAttribute('aria-busy');
          throw error;
        },
      );
    }
    return brandsTask;
  }

  function requestBrands() {
    if (mode() !== 'elegir') return;
    ensureBrands().catch(() => {
      setField('pt-marca', true, 'No pudimos cargar las marcas. Podés ingresar la valuación a mano.');
    });
  }

  async function loadBrand(slug: string) {
    const cached = brandFiles.get(slug);
    if (cached) return cached;
    const response = await fetch(`${base}${slug}.json`);
    if (!response.ok) throw new Error('modelos');
    const data: unknown = await response.json();
    if (!isBrandFile(data)) throw new Error('modelos');
    brandFiles.set(slug, data);
    return data;
  }

  function selectedModel(): { name: string; model: ModelRecord } | null {
    if (!currentFile || !modelo.value || !currentFile[modelo.value]) return null;
    return { name: modelo.value, model: currentFile[modelo.value] };
  }

  function showValuation() {
    const selected = selectedModel();
    const yearRaw = anioElegir.value;
    if (!selected || !yearRaw) {
      valBox.hidden = true;
      valBox.replaceChildren();
      return;
    }
    const year = yearRaw === '0km' ? '0km' : Number(yearRaw);
    const found = selected.model.v.find(([item]) => item === year);
    if (!found) {
      valBox.hidden = true;
      return;
    }
    const inferred = typeof year === 'number' && (selected.model.e ?? []).includes(year);
    const yearLabel = year === '0km' ? '0 km' : String(year);
    const strong = document.createElement('strong');
    strong.textContent = 'Valuación: ';
    valBox.replaceChildren(strong, document.createTextNode(`${formatArs(found[1])} · ${yearLabel} · ${tipoLabel(selected.model.t)}.`));
    if (inferred) {
      valBox.append(document.createTextNode(' Este año no está publicado en la tabla: se tomó un 8% más que la valuación del año anterior.'));
    }
    valBox.hidden = false;
  }

  function fillYears() {
    const selected = selectedModel();
    placeholder(anioElegir, 'Elegí un año');
    anioElegir.disabled = !selected;
    valBox.hidden = true;
    if (!selected) return;
    const inferred = new Set(selected.model.e ?? []);
    const years = [...selected.model.v].sort((a, b) => {
      if (a[0] === '0km') return -1;
      if (b[0] === '0km') return 1;
      return Number(b[0]) - Number(a[0]);
    });
    for (const [year] of years) {
      const label = year === '0km' ? '0 km' : inferred.has(year) ? `${year} (8% sobre el año anterior)` : String(year);
      anioElegir.add(new Option(label, String(year)));
    }
  }

  async function onMarca() {
    const request = ++brandRequest;
    currentFile = null;
    placeholder(modelo, marca.value ? 'Cargando modelos…' : 'Elegí un modelo');
    modelo.disabled = true;
    placeholder(anioElegir, 'Elegí un año');
    anioElegir.disabled = true;
    valBox.hidden = true;
    setField('pt-modelo', false);
    if (!marca.value) return;
    try {
      const file = await loadBrand(marca.value);
      if (request !== brandRequest) return;
      currentFile = file;
      placeholder(modelo, 'Elegí un modelo');
      for (const name of Object.keys(file)) modelo.add(new Option(name, name));
      modelo.disabled = false;
    } catch {
      if (request !== brandRequest) return;
      placeholder(modelo, 'Elegí un modelo');
      setField('pt-modelo', true, 'No pudimos cargar los modelos. Probá de nuevo o ingresá la valuación a mano.');
    }
  }

  function validar() {
    clearErrors();
    let ok = true;
    const fail = (id: string, message: string) => {
      setField(id, true, message);
      ok = false;
    };
    if (!jur.value) fail('pt-jur', 'Elegí una jurisdicción.');
    if (mode() === 'elegir') {
      if (!marca.value) fail('pt-marca', 'Elegí una marca.');
      if (!modelo.value) fail('pt-modelo', 'Elegí un modelo.');
      if (!anioElegir.value) fail('pt-anio-elegir', 'Elegí un año.');
      if (ccElegir.value === '' || Number(ccElegir.value) < 0) fail('pt-cc-elegir', 'Ingresá la cilindrada (0 si es eléctrica).');
    } else {
      const valuation = Number(val.value);
      if (!(Number.isFinite(valuation) && valuation > 0)) fail('pt-val', 'Ingresá una valuación mayor a 0.');
      const year = Number(anio.value);
      if (!(year >= 1980 && year <= FISCAL_YEAR + 1)) fail('pt-anio', 'Ingresá un año válido.');
      if (cc.value === '' || Number(cc.value) < 0) fail('pt-cc', 'Ingresá la cilindrada (0 si es eléctrica).');
    }
    return ok;
  }

  function readInput(): PatentInput & { inferred: boolean } {
    if (mode() === 'manual') {
      return {
        jurisdiction: jur.value,
        valuation: Number(val.value),
        year: Number(anio.value),
        displacementCc: Number(cc.value),
        inferred: false,
      };
    }
    const selected = selectedModel();
    const year = anioElegir.value === '0km' ? '0km' : Number(anioElegir.value);
    const amount = selected?.model.v.find(([item]) => item === year)?.[1];
    if (!selected || amount === undefined) throw new Error('Elegí una moto de la lista.');
    return {
      jurisdiction: jur.value,
      valuation: amount,
      year,
      displacementCc: Number(ccElegir.value),
      inferred: typeof year === 'number' && (selected.model.e ?? []).includes(year),
    };
  }

  function moneyLine(line: PatentLine) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'pt-k';
    label.textContent = line.label;
    const value = document.createElement('span');
    value.className = 'pt-v';
    value.textContent = 'amount' in line ? formatArs(roundPesos(line.amount)) : line.text;
    item.append(label, value);
    return item;
  }

  function statusBox(kind: string, lead: string, message: string) {
    const box = document.createElement('div');
    box.className = `pt-status pt-status--${kind}`;
    box.setAttribute('role', 'status');
    const strong = document.createElement('strong');
    strong.textContent = lead;
    const joiner = kind === 'info' ? ', ' : ' ';
    box.append(strong, document.createTextNode(`${joiner}${message}`));
    return box;
  }

  function sourceLine(resultData: PatentResult, linkText: string, intro: 'oficial' | 'fuente' | 'ninguna') {
    const paragraph = document.createElement('p');
    paragraph.className = 'pt-src';
    if (intro === 'oficial' && resultData.sourceLabel) {
      paragraph.append(document.createTextNode(`Fuente oficial citada: ${resultData.sourceLabel}. `));
    } else if (intro === 'fuente' && resultData.sourceLabel) {
      paragraph.append(document.createTextNode(`Fuente: ${resultData.sourceLabel}. `));
    }
    if (resultData.sourceUrl) {
      const link = document.createElement('a');
      link.href = resultData.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = linkText;
      paragraph.append(link);
    }
    if (mode() === 'elegir') {
      paragraph.append(document.createTextNode(paragraph.childNodes.length ? ' ' : ''));
      const valuation = document.createElement('a');
      valuation.href = DNRPA_VALUATION_URL;
      valuation.target = '_blank';
      valuation.rel = 'noopener';
      valuation.textContent = DNRPA_VALUATION_CITE;
      paragraph.append(valuation);
    }
    return paragraph;
  }

  function amountCard(annual: number, sub: string) {
    const card = document.createElement('div');
    card.className = 'pt-amount';
    const label = document.createElement('p');
    label.className = 'pt-label';
    label.textContent = 'Estimación anual';
    const big = document.createElement('p');
    big.className = 'pt-big';
    big.textContent = formatArs(roundPesos(annual));
    const note = document.createElement('p');
    note.className = 'pt-sub';
    note.textContent = sub;
    card.append(label, big, note);
    return card;
  }

  function installmentText(data: PatentResult) {
    if (!data.installments || data.annual === null) {
      return `Cantidad de cuotas: dato a confirmar en el organismo · ${data.jurisdictionName}`;
    }
    const quota = roundPesos(data.annual / data.installments);
    if (data.installments === 1) {
      return `1 cuota de ${formatArs(quota)} (calendario a confirmar en el organismo)`;
    }
    return `Hasta ${data.installments} cuotas de aprox. ${formatArs(quota)} (calendario a confirmar en el organismo)`;
  }

  function render(data: PatentResult, input: PatentInput & { inferred: boolean }) {
    result.classList.add('is-on');
    result.hidden = false;
    result.replaceChildren();
    const linkText = input.jurisdiction === 'buenos-aires' ? 'ARBA' : 'Sitio del organismo';

    if (data.kind === 'municipal') {
      result.append(
        statusBox('info', 'En la Provincia de Buenos Aires la patente de motos la cobra cada municipio', data.message ?? ''),
        sourceLine(data, linkText, 'fuente'),
        aviso.content.cloneNode(true),
      );
    } else if (data.kind === 'soon') {
      result.append(statusBox('soon', 'Próximamente.', data.message ?? ''), aviso.content.cloneNode(true));
    } else if (data.kind === 'unconfirmed') {
      result.append(
        statusBox('warn', 'Dato a confirmar.', data.message ?? ''),
        sourceLine(data, 'Fuente de la jurisdicción', 'ninguna'),
        aviso.content.cloneNode(true),
      );
    } else if (data.kind === 'exempt') {
      result.append(statusBox('ok', 'Exenta o no alcanzada.', data.message ?? ''));
      if (data.warning) {
        const warning = document.createElement('div');
        warning.className = 'pt-status pt-status--warn';
        warning.textContent = data.warning;
        result.append(warning);
      }
      result.append(amountCard(0, `${data.jurisdictionName} · ${data.collector ?? ''}`));
      result.append(sourceLine(data, linkText, 'oficial'), aviso.content.cloneNode(true));
    } else {
      result.append(amountCard(data.annual ?? 0, installmentText(data)));
      const list = document.createElement('ul');
      list.className = 'pt-break';
      for (const line of data.lines) list.append(moneyLine(line));
      const yearLabel = input.year === '0km' ? '0 km' : String(input.year);
      const valuationText = `${formatArs(roundPesos(input.valuation))}${input.inferred ? ' (8% sobre el año anterior)' : ''}`;
      list.append(
        moneyLine({ label: 'Valuación usada', text: valuationText }),
        moneyLine({ label: 'Cilindrada', text: input.displacementCc ? `${input.displacementCc} cc` : 'Eléctrica / 0 cc' }),
        moneyLine({ label: 'Año del modelo', text: yearLabel }),
      );
      result.append(list);
      if (data.warning) {
        const warning = document.createElement('div');
        warning.className = 'pt-status pt-status--warn';
        warning.textContent = data.warning;
        result.append(warning);
      }
      result.append(sourceLine(data, linkText, 'oficial'), aviso.content.cloneNode(true));
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function showFailure(message: string) {
    result.classList.add('is-on');
    result.hidden = false;
    const box = statusBox('warn', 'Dato a confirmar.', message);
    result.replaceChildren(box);
  }

  async function calcular(event?: Event) {
    event?.preventDefault();
    if (mode() === 'elegir') {
      try {
        await ensureBrands();
      } catch {
        setField('pt-marca', true, 'No pudimos cargar las marcas. Podés ingresar la valuación a mano.');
        return;
      }
    }
    if (!validar()) {
      result.classList.remove('is-on');
      result.hidden = true;
      return;
    }
    let input: PatentInput & { inferred: boolean };
    try {
      input = readInput();
    } catch {
      setField('pt-modelo', true, 'Elegí un modelo.');
      return;
    }
    try {
      render(calculatePatent(input), input);
    } catch {
      showFailure('Revisá la valuación, el año y la cilindrada.');
    }
  }

  function prefillFromQuery() {
    const params = new URLSearchParams(location.search);
    const jurisdiction = params.get('jur');
    if (jurisdiction) jur.value = jurisdiction;
    if (params.get('val')) {
      const manual = root.querySelector<HTMLInputElement>('input[name="pt-mode"][value="manual"]');
      if (manual) manual.checked = true;
      syncMode();
      val.value = params.get('val') ?? '';
    }
    if (params.get('cc')) cc.value = params.get('cc') ?? '';
    if (params.get('anio')) anio.value = params.get('anio') ?? '';
    if (params.get('auto') === '1') void calcular();
  }

  root.addEventListener('focusin', requestBrands);
  root.addEventListener('pointerdown', requestBrands);
  marca.addEventListener('change', () => void onMarca());
  modelo.addEventListener('change', fillYears);
  anioElegir.addEventListener('change', showValuation);
  root.querySelectorAll<HTMLInputElement>('input[name="pt-mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      syncMode();
      if (mode() === 'elegir') requestBrands();
    });
  });
  root.addEventListener('submit', (event) => void calcular(event));
  byId<HTMLButtonElement>('pt-reset').addEventListener('click', () => {
    root.reset();
    marca.value = '';
    brandRequest += 1;
    currentFile = null;
    syncMode();
    placeholder(modelo, 'Elegí un modelo');
    modelo.disabled = true;
    placeholder(anioElegir, 'Elegí un año');
    anioElegir.disabled = true;
    ccElegir.value = '';
    valBox.hidden = true;
    result.classList.remove('is-on');
    result.hidden = true;
    clearErrors();
  });
  syncMode();
  prefillFromQuery();
}
