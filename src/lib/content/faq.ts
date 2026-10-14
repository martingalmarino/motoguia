import type { CollectionEntry } from 'astro:content';
import { formatArs, formatDate, formatInteger } from '../format';
import { displayName, powerLabel, priceTypeLabel } from './present';

type Moto = CollectionEntry<'motorcycles'>;

export type Faq = { id: string; question: string; answer: string };

const num = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
const sentence = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function priceFaq(entry: Moto, name: string): Faq {
  const d = entry.data;
  const question = `¿Cuánto cuesta la ${name}?`;
  if (!d.price) {
    return {
      id: 'precio',
      question,
      answer: `La marca no publica un precio para la ${name}. Pedí una cotización por escrito en un concesionario y confirmá qué versión te ofrecen y si el precio incluye patentamiento.`,
    };
  }
  const label = priceTypeLabel(d.price.priceType).toLowerCase();
  const date = formatDate(d.price.observedAt);
  const priced = d.versions.filter((version) => version.priceARS !== null);
  const amount =
    priced.length > 1
      ? priced.map((version) => `${formatArs(version.priceARS!)} la versión ${version.name}`).join(' y ')
      : d.price.minARS === d.price.maxARS
        ? formatArs(d.price.minARS)
        : `entre ${formatArs(d.price.minARS)} y ${formatArs(d.price.maxARS)} según la versión`;
  const registration =
    d.price.includesRegistration === null
      ? 'La fuente no aclara si incluye patentamiento: confirmá el precio final con el vendedor.'
      : d.price.includesRegistration
        ? 'Según la fuente, incluye patentamiento.'
        : 'Según la fuente, no incluye patentamiento.';
  return {
    id: 'precio',
    question,
    answer: `El ${label} al ${date} es de ${amount}. ${registration}`,
  };
}

function engineFaq(entry: Moto, name: string): Faq | null {
  const d = entry.data;
  if (d.engineType === 'electric') {
    const e = d.electric;
    if (!e) return null;
    const parts: string[] = [];
    if (e.nominalPowerKw) parts.push(`un motor de ${formatInteger(Math.round(e.nominalPowerKw * 1000))} W de potencia nominal`);
    if (e.peakPowerKw) parts.push(`${num(e.peakPowerKw)} kW de pico`);
    const battery: string[] = [];
    if (e.voltageV && e.capacityAh) battery.push(`${formatInteger(e.voltageV)} V y ${formatInteger(e.capacityAh)} Ah`);
    if (e.batteryKwh) battery.push(`unos ${num(e.batteryKwh)} kWh`);
    if (e.batteryChemistry) battery.push(`de ${e.batteryChemistry}`);
    let answer = parts.length ? `La ${name} declara ${parts.join(' y ')}.` : `La marca no informa la potencia de la ${name}.`;
    if (battery.length) answer += ` La batería es de ${battery.join(', ')}`;
    if (battery.length && e.removableBattery !== null) answer += e.removableBattery ? ' y se puede extraer para cargarla fuera de la moto.' : ' y va fija en la moto.';
    else if (battery.length) answer += '.';
    return { id: 'potencia', question: `¿Qué potencia y batería tiene la ${name}?`, answer };
  }
  const engine = d.engine;
  const cc = engine?.displacementCc;
  const hasPower = Boolean(engine?.declaredPowerOriginalValue);
  let answer: string;
  if (cc && hasPower) answer = `La ${name} tiene un motor de ${num(cc)} cc con ${powerLabel(entry)} declarados por la marca.`;
  else if (cc) answer = `La ${name} tiene un motor de ${num(cc)} cc. La marca no informa la potencia.`;
  else answer = `La marca no informa la cilindrada ni la potencia de la ${name} en su ficha.`;
  if (engine?.transmission) answer += ` Transmisión: ${lower(engine.transmission)}.`;
  return { id: 'motor', question: `¿Qué cilindrada y potencia tiene la ${name}?`, answer };
}

function brakesFaq(entry: Moto, name: string): Faq | null {
  const c = entry.data.chassis;
  if (!c) return null;
  const brakes: string[] = [];
  if (c.brakesFront) brakes.push(`adelante, ${lower(c.brakesFront)}`);
  if (c.brakesRear) brakes.push(`atrás, ${lower(c.brakesRear)}`);
  const detail = brakes.length ? ` Frenos: ${brakes.join('; ')}.` : '';
  let answer: string;
  if (c.abs === true) answer = `Sí. La ${name} tiene ABS.${detail}`;
  else if (c.abs === false && c.cbs) answer = 'No. Tiene CBS, un frenado combinado que acciona los dos frenos a la vez, pero no evita que la rueda se bloquee como el ABS.';
  else if (c.abs === false) answer = `No, la ${name} no tiene ABS.${detail}`;
  else if (c.cbs) answer = 'La ficha no menciona ABS. Tiene CBS, un frenado combinado que acciona los dos frenos a la vez; ayuda a repartir la frenada, pero no evita que la rueda se bloquee como el ABS.';
  else if (brakes.length) answer = `La ficha no menciona ABS ni CBS.${detail}`;
  else return null;
  return { id: 'abs', question: `¿La ${name} tiene ABS?`, answer };
}

function sizeFaq(entry: Moto, name: string): Faq | null {
  const d = entry.data;
  const parts: string[] = [];
  if (d.dimensions?.weightKg) {
    const basis = d.dimensions.weightBasis ? ` (${d.dimensions.weightBasis})` : '';
    parts.push(`La marca declara ${formatInteger(d.dimensions.weightKg)} kg${basis}.`);
  }
  if (d.dimensions?.seatHeightMm) parts.push(`El asiento está a ${formatInteger(d.dimensions.seatHeightMm)} mm del piso.`);
  if (d.engineType === 'combustion' && d.fuel?.tankLiters) parts.push(`El tanque es de ${num(d.fuel.tankLiters)} litros.`);
  if (!parts.length) return null;
  const question =
    d.engineType === 'combustion' && d.fuel?.tankLiters
      ? `¿Cuánto pesa la ${name} y qué tanque tiene?`
      : `¿Cuánto pesa la ${name}?`;
  if (!d.dimensions?.weightKg) parts.unshift('La marca no informa el peso.');
  return { id: 'peso', question, answer: parts.join(' ') };
}

function rangeFaq(entry: Moto, name: string): Faq | null {
  const e = entry.data.electric;
  if (entry.data.engineType !== 'electric' || !e) return null;
  const parts: string[] = [];
  if (e.declaredRangeKm) {
    const conditions = (e.rangeConditions ?? '').trim();
    const [first, ...rest] = conditions.split(/(?<=\.)\s+/);
    if (first && /^(A|En) /.test(first)) {
      const how = first.startsWith('A ') ? `medida ${lower(first)}` : lower(first);
      parts.push(`La marca declara hasta ${formatInteger(e.declaredRangeKm)} km de autonomía, ${how.replace(/\.$/, '')}.${rest.length ? ` ${rest.join(' ')}` : ''}`);
    } else {
      parts.push(`La marca declara hasta ${formatInteger(e.declaredRangeKm)} km de autonomía.${conditions ? ` ${sentence(conditions)}` : ''}`);
    }
  } else {
    parts.push('La marca no informa la autonomía.');
  }
  if (e.chargingTimeHours) {
    const raw = e.chargingTimeHours.trim();
    const range = raw.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)$/);
    const hours = range ? `entre ${range[1]} y ${range[2]}` : raw.replace(/^~\s*/, 'unas ');
    parts.push(`La carga completa demora ${hours} horas, según la marca.`);
  }
  const question = e.chargingTimeHours
    ? `¿Qué autonomía tiene la ${name} y cuánto tarda en cargar?`
    : `¿Qué autonomía tiene la ${name}?`;
  return { id: 'autonomia', question, answer: parts.join(' ') };
}

function consumptionFaq(entry: Moto, name: string): Faq | null {
  const d = entry.data;
  if (d.engineType !== 'combustion') return null;
  if (d.fuel?.consumptionL100km) {
    const basis = d.fuel.measurementBasis ? ` ${sentence(d.fuel.measurementBasis)}` : '';
    return {
      id: 'consumo',
      question: `¿Cuánto consume la ${name}?`,
      answer: `La marca declara ${num(d.fuel.consumptionL100km)} litros cada 100 km.${basis}`,
    };
  }
  return {
    id: 'consumo',
    question: `¿Cuánto consume la ${name}?`,
    answer: 'La marca no publica el consumo. Para estimar tu gasto mensual, cargá en la calculadora de combustible los kilómetros que hacés y el consumo que te indique el concesionario.',
  };
}

function licenceFaq(entry: Moto, name: string): Faq | null {
  const d = entry.data;
  let answer: string | null = null;
  if (d.engineType === 'combustion' && d.engine?.displacementCc) {
    const cc = d.engine.displacementCc;
    if (cc <= 150) answer = `Con ${num(cc)} cc, corresponde la licencia clase A 1.2, que habilita motos de hasta 150 cc. Confirmá la cilindrada en la cédula.`;
    else if (cc <= 300) answer = `Con ${num(cc)} cc, corresponde la licencia clase A 1.3 (de 150 a 300 cc). Confirmá la cilindrada en la cédula.`;
  } else if (d.engineType === 'electric' && d.electric?.nominalPowerKw) {
    const kw = d.electric.nominalPowerKw;
    if (kw <= 4) answer = `Con ${num(kw)} kW declarados, corresponde la clase A 1.1 (hasta 4 kW) si esa cifra es la potencia continua nominal. Verificá el dato en la cédula.`;
    else if (kw <= 11) answer = `Con ${num(kw)} kW declarados, corresponde la clase A 1.2 (hasta 11 kW) si esa cifra es la potencia continua nominal. Verificá el dato en la cédula.`;
  }
  if (!answer && d.licenceHint) answer = sentence(d.licenceHint);
  if (!answer) return null;
  return { id: 'licencia', question: `¿Qué licencia necesito para manejar la ${name}?`, answer };
}

function warrantyFaq(entry: Moto, name: string): Faq {
  const d = entry.data;
  const value = d.warranty ?? d.electric?.warranty ?? null;
  return {
    id: 'garantia',
    question: `¿Qué garantía tiene la ${name}?`,
    answer: value
      ? `${sentence(value)} Revisá las condiciones de la garantía (services obligatorios y exclusiones) antes de comprar.`
      : 'La marca no informa la garantía en la página del modelo. Pedí las condiciones por escrito al comprar.',
  };
}

function versionsFaq(entry: Moto, name: string): Faq | null {
  const d = entry.data;
  if (d.versions.length > 1) {
    const list = d.versions.map((version) => (version.note ? `${version.name}: ${lower(version.note.replace(/\.$/, ''))}` : version.name));
    const note = d.versionNote ? ` ${sentence(d.versionNote)}` : '';
    return {
      id: 'versiones',
      question: `¿Qué versiones tiene la ${name}?`,
      answer: `Se vende en ${d.versions.length} versiones. ${list.map(sentence).join(' ')}${note}`,
    };
  }
  if (d.versionNote) {
    return { id: 'versiones', question: `¿Qué versiones tiene la ${name}?`, answer: sentence(d.versionNote) };
  }
  return null;
}

/** Preguntas frecuentes de una ficha. Solo usa datos cargados; si falta un dato, la respuesta lo dice. */
export function modelFaqs(entry: Moto): Faq[] {
  const name = displayName(entry);
  return [
    priceFaq(entry, name),
    engineFaq(entry, name),
    rangeFaq(entry, name),
    consumptionFaq(entry, name),
    brakesFaq(entry, name),
    sizeFaq(entry, name),
    licenceFaq(entry, name),
    warrantyFaq(entry, name),
    versionsFaq(entry, name),
  ].filter((faq): faq is Faq => faq !== null);
}
