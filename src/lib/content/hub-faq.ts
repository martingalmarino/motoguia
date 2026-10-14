import type { CollectionEntry } from 'astro:content';
import type { Faq } from './faq';
import type { Hub } from './hubs';
import { displayName, shortPrice } from './present';

type Moto = CollectionEntry<'motorcycles'>;

const num = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 2 });

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;
}

/** Preguntas de una página de tipo o cilindrada, armadas con los datos de sus fichas. */
export function hubFaqs(hub: Hub, models: Moto[]): Faq[] {
  const faqs: Faq[] = [];
  const noun = hub.noun;
  const hasElectric = models.some((entry) => entry.data.engineType === 'electric');

  const disc = models.filter((entry) => /disco/i.test(entry.data.chassis?.brakesFront ?? ''));
  if (disc.length) {
    const names = disc.map((entry) =>
      /según versión|o disco|o tambor/i.test(entry.data.chassis?.brakesFront ?? '')
        ? `${displayName(entry)} (según versión)`
        : displayName(entry),
    );
    faqs.push({
      id: 'disco',
      question: `¿Qué ${noun} tienen freno a disco adelante?`,
      answer: `En el catálogo, ${disc.length === 1 ? 'la que declara' : 'las que declaran'} freno delantero a disco ${disc.length === 1 ? 'es' : 'son'}: ${list(names)}.`,
    });
  }

  const abs = models.filter((entry) => entry.data.chassis?.abs === true);
  const cbs = models.filter((entry) => entry.data.chassis?.cbs === true);
  faqs.push({
    id: 'abs',
    question: `¿Qué ${noun} tienen ABS?`,
    answer: abs.length
      ? `Declaran ABS: ${list(abs.map(displayName))}.${cbs.length ? ` Con CBS (frenado combinado, que no es ABS): ${list(cbs.map(displayName))}.` : ''}`
      : `Ningún modelo de esta lista declara ABS.${cbs.length ? ` Tienen CBS, un frenado combinado que reparte la frenada pero no evita el bloqueo de la rueda: ${list(cbs.map(displayName))}.` : ''}`,
  });

  const combustion = models.filter((entry) => entry.data.engineType === 'combustion');
  const withHp = combustion
    .filter((entry) => entry.data.engine?.declaredPowerOriginalUnit === 'hp' && entry.data.engine.declaredPowerOriginalValue)
    .sort((a, b) => b.data.engine!.declaredPowerOriginalValue! - a.data.engine!.declaredPowerOriginalValue!);
  if (withHp.length >= 2) {
    const top = withHp[0];
    const missing = combustion.length - withHp.length;
    faqs.push({
      id: 'potencia',
      question: `¿Cuál de ${hub.theNoun}${hasElectric ? ' a nafta' : ''} tiene más potencia declarada?`,
      answer: `Entre las que publican potencia, la ${displayName(top)} declara ${num(top.data.engine!.declaredPowerOriginalValue!)} hp.${missing > 0 ? ` ${missing === 1 ? 'Un modelo no publica' : `${missing} modelos no publican`} ese dato, y cada marca puede medir con un método distinto.` : ' Cada marca puede medir con un método distinto.'}`,
    });
  }

  const electric = models.filter((entry) => entry.data.engineType === 'electric' && entry.data.electric?.declaredRangeKm);
  if (electric.length >= 2) {
    const top = [...electric].sort((a, b) => b.data.electric!.declaredRangeKm! - a.data.electric!.declaredRangeKm!)[0];
    faqs.push({
      id: 'autonomia',
      question: `¿Qué eléctrica de esta lista declara más autonomía?`,
      answer: `La ${displayName(top)} declara hasta ${num(top.data.electric!.declaredRangeKm!)} km. Cada marca mide en condiciones distintas (velocidad, peso, clima), así que revisá las condiciones en cada ficha.`,
    });
  }

  const priced = models.filter((entry) => entry.data.price);
  faqs.push({
    id: 'precio',
    question: `¿Cuánto cuestan ${hub.theNoun}?`,
    answer: priced.length
      ? `Con precio publicado en MotoGuía: ${list(priced.map((entry) => `${displayName(entry)}, ${shortPrice(entry)}`))}. Cada precio tiene su fecha y su tipo en la ficha. Para el resto de los modelos, pedí una cotización en un concesionario.`
      : 'Las marcas de esta lista no publican precios en sus sitios. Pedí una cotización por escrito en un concesionario y confirmá qué incluye.',
  });

  faqs.push({
    id: 'licencia',
    question: `¿Qué licencia necesito para manejar ${hub.aNoun}?`,
    answer: hasElectric
      ? 'Para las de nafta de hasta 150 cc, la clase A 1.2. Para las eléctricas depende de la potencia continua nominal: hasta 4 kW corresponde la A 1.1 y hasta 11 kW la A 1.2. Verificá el dato en la cédula.'
      : 'Para motos de hasta 150 cc corresponde la licencia clase A 1.2. Verificá la cilindrada en la cédula del vehículo.',
  });

  return faqs;
}
