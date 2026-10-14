import type { CollectionEntry } from 'astro:content';

type Moto = CollectionEntry<'motorcycles'>;

export type Hub = {
  key: string;
  kind: 'category' | 'displacement';
  path: string;
  /** Nombre corto para enlaces y migas: "Cub", "110 cc". */
  label: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  lede: string;
  intro: string[];
  /** Sustantivo para preguntas: "cub", "motos de 150 cc". */
  noun: string;
  /** Con artículo: "las cub", "los scooters". */
  theNoun: string;
  /** En singular con artículo indefinido: "una cub", "un scooter". */
  aNoun: string;
  match: (entry: Moto) => boolean;
};

/** Las páginas con menos modelos no se generan para no publicar listados vacíos. */
export const HUB_MIN_MODELS = 3;

const cc = (entry: Moto) => (entry.data.engineType === 'combustion' ? entry.data.engine?.displacementCc ?? null : null);

export const HUBS: Hub[] = [
  {
    key: 'cub',
    kind: 'category',
    path: '/motos/tipo/cub/',
    label: 'Cub',
    h1: 'Motos cub en Argentina',
    seoTitle: 'Motos cub en Argentina: modelos, ficha técnica y precios',
    seoDescription:
      'Compará las motos cub que se venden en Argentina: cilindrada, potencia declarada, frenos, CBS, peso, tanque y precio de referencia de cada modelo.',
    lede: 'Las cub de 110 cc ocupan los primeros puestos en patentamientos. Acá las tenés juntas para comparar motor, frenos y equipamiento.',
    intro: [
      'Una cub combina un cuadro bajo, que permite subir sin pasar la pierna por encima del tanque, con un motor de 100 a 125 cc y caja semiautomática de 4 velocidades: cambiás con el pie pero sin embrague manual. Por eso es la moto más usada para traslados diarios y reparto.',
      'Entre modelos de la misma cilindrada, las diferencias más claras están en los frenos (tambor o disco adelante, con o sin CBS), el equipamiento (tablero, luces LED, puertos USB) y la garantía. La potencia y el peso no siempre se pueden comparar: no todas las marcas los publican y algunas declaran el peso en seco y otras en orden de marcha.',
    ],
    noun: 'cub',
    theNoun: 'las cub',
    aNoun: 'una cub',
    match: (entry) => entry.data.category === 'cub',
  },
  {
    key: 'scooter',
    kind: 'category',
    path: '/motos/tipo/scooter/',
    label: 'Scooter',
    h1: 'Scooters en Argentina',
    seoTitle: 'Scooters en Argentina: modelos a nafta y eléctricos',
    seoDescription:
      'Scooters y motos automáticas que se venden en Argentina, a nafta y eléctricos: potencia, batería, autonomía declarada, frenos, peso y precio de referencia.',
    lede: 'Motos automáticas para la ciudad, a nafta o eléctricas: no tenés que cambiar marchas ni usar embrague.',
    intro: [
      'En un scooter la transmisión es automática: acelerás y frenás, sin palanca de cambios. Suelen tener piso plano o un espacio para los pies y lugar de guardado bajo el asiento, y están pensados para trayectos urbanos cortos.',
      'En los eléctricos, mirá la potencia nominal (define la clase de licencia), la autonomía declarada y en qué condiciones la mide la marca, el tiempo de carga y si la batería se puede sacar para cargarla en casa.',
    ],
    noun: 'scooters',
    theNoun: 'los scooters',
    aNoun: 'un scooter',
    match: (entry) => entry.data.category === 'scooter',
  },
  {
    key: 'trail',
    kind: 'category',
    path: '/motos/tipo/trail/',
    label: 'Trail',
    h1: 'Motos trail en Argentina',
    seoTitle: 'Motos trail en Argentina: modelos de 150 cc y ficha técnica',
    seoDescription:
      'Motos trail de 150 cc que se venden en Argentina: potencia declarada, frenos, ABS, altura de asiento, peso, tanque y precio de referencia de cada modelo.',
    lede: 'Motos de uso mixto, para ciudad y caminos de tierra, con suspensiones más largas y rueda delantera grande.',
    intro: [
      'Una trail tiene suspensiones de mayor recorrido, rueda delantera de mayor diámetro y neumáticos de uso mixto. Eso le da más despeje para caminos de ripio o tierra, a cambio de un asiento más alto que el de una moto de calle.',
      'Antes de elegir, fijate la altura de asiento (que llegues bien al piso), el tipo de freno delantero y si tiene ABS, y la capacidad del tanque si vas a hacer tramos largos.',
    ],
    noun: 'motos trail',
    theNoun: 'las motos trail',
    aNoun: 'una moto trail',
    match: (entry) => entry.data.category === 'trail',
  },
  {
    key: 'calle',
    kind: 'category',
    path: '/motos/tipo/calle/',
    label: 'Calle',
    h1: 'Motos de calle en Argentina',
    seoTitle: 'Motos de calle (street) en Argentina: modelos y ficha técnica',
    seoDescription:
      'Motos de calle o street que se venden en Argentina: cilindrada, potencia, caja, frenos, peso, tanque y precio de referencia, a nafta y eléctricas.',
    lede: 'Motos de calle con posición de manejo erguida, caja manual y tanque entre las piernas.',
    intro: [
      'Una moto de calle, o street, tiene el tanque delante del asiento, caja manual con embrague y una posición de manejo erguida. Frente a una cub, suma cilindrada y estabilidad para avenidas y rutas cortas.',
      'Entre modelos de 150 cc, compará la potencia declarada, los frenos (disco delantero, CBS o ABS), el tanque y el peso, siempre con la misma base de medición.',
    ],
    noun: 'motos de calle',
    theNoun: 'las motos de calle',
    aNoun: 'una moto de calle',
    match: (entry) => entry.data.category === 'street',
  },
  {
    key: '110cc',
    kind: 'displacement',
    path: '/motos/110cc/',
    label: '110 cc',
    h1: 'Motos de 110 cc en Argentina',
    seoTitle: 'Motos 110 cc en Argentina: modelos, potencia y precios',
    seoDescription:
      'Todas las motos de 100 a 125 cc del catálogo: cub y scooters con su potencia declarada, caja, frenos, peso, tanque y precio de referencia con fecha.',
    lede: 'Las motos de 100 a 125 cc: cub y scooters para moverte todos los días por la ciudad.',
    intro: [
      'En este rango están la mayoría de las motos patentadas en Argentina. Casi todas son cub con caja semiautomática de 4 velocidades, y algunas son scooters automáticos.',
      'Con la licencia clase A 1.2 podés manejar motos de hasta 150 cc, así que cualquiera de estos modelos entra en la misma clase. Para comparar, mirá frenos, equipamiento, garantía y precio.',
    ],
    noun: 'motos de 110 cc',
    theNoun: 'las motos de 110 cc',
    aNoun: 'una moto de 110 cc',
    match: (entry) => {
      const value = cc(entry);
      return value !== null && value >= 100 && value <= 125;
    },
  },
  {
    key: '150cc',
    kind: 'displacement',
    path: '/motos/150cc/',
    label: '150 cc',
    h1: 'Motos de 150 cc en Argentina',
    seoTitle: 'Motos 150 cc en Argentina: calle y trail, ficha y precios',
    seoDescription:
      'Motos de 150 cc que se venden en Argentina, de calle y trail: potencia declarada, caja de 5, frenos, ABS, peso, tanque y precio de referencia.',
    lede: 'Motos de 150 cc de calle y trail, con caja manual de 5 velocidades.',
    intro: [
      'Las 150 cc son el paso siguiente a las cub: suman cilindrada, caja manual de 5 velocidades y, en general, freno a disco adelante. Las hay de calle, para ciudad y rutas cortas, y trail, para caminos de tierra.',
      'Siguen dentro de la licencia clase A 1.2 (hasta 150 cc). Para elegir, compará el formato, la altura de asiento, los frenos y el tanque.',
    ],
    noun: 'motos de 150 cc',
    theNoun: 'las motos de 150 cc',
    aNoun: 'una moto de 150 cc',
    match: (entry) => {
      const value = cc(entry);
      return value !== null && value > 125 && value <= 160;
    },
  },
];

export function hubModels(hub: Hub, entries: Moto[]): Moto[] {
  return entries.filter(hub.match);
}

export function activeHubs(entries: Moto[]): Hub[] {
  return HUBS.filter((hub) => hubModels(hub, entries).length >= HUB_MIN_MODELS);
}

/** Páginas de tipo y cilindrada que incluyen a un modelo. */
export function hubsForModel(entry: Moto, entries: Moto[]): Hub[] {
  return activeHubs(entries).filter((hub) => hub.match(entry));
}
