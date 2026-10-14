import type { APIRoute } from 'astro';
import { paths, site } from '../config/site';
import {
  getPublishedComparisons,
  getPublishedGuides,
  getPublishedMotorcycles,
  motorcycleUrl,
} from '../lib/content/catalog';
import { activeHubs } from '../lib/content/hubs';
import { categoryLabel, displayName, powerLabel, priceTypeLabel, shortPrice } from '../lib/content/present';
import { formatDate } from '../lib/format';
import { absoluteUrl } from '../lib/seo/urls';

const decimal = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 2 });

export const GET: APIRoute = async () => {
  const motos = await getPublishedMotorcycles();
  const guides = await getPublishedGuides();
  const comparisons = await getPublishedComparisons();
  const hubs = activeHubs(motos);

  const modelLine = (entry: (typeof motos)[number]) => {
    const d = entry.data;
    const facts: string[] = [categoryLabel(d.category)];
    if (d.engineType === 'electric') {
      facts.push('eléctrica');
      if (d.electric?.nominalPowerKw) facts.push(`${decimal(d.electric.nominalPowerKw)} kW`);
      if (d.electric?.declaredRangeKm) facts.push(`hasta ${decimal(d.electric.declaredRangeKm)} km declarados`);
    } else {
      if (d.engine?.displacementCc) facts.push(`${decimal(d.engine.displacementCc)} cc`);
      if (d.engine?.declaredPowerOriginalValue) facts.push(powerLabel(entry));
    }
    if (d.chassis?.abs) facts.push('ABS');
    else if (d.chassis?.cbs) facts.push('CBS');
    if (d.price) facts.push(`${priceTypeLabel(d.price.priceType).toLowerCase()} ${shortPrice(entry)} al ${formatDate(d.price.observedAt)}`);
    return `- [${displayName(entry)}](${absoluteUrl(motorcycleUrl(entry))}): ${facts.join(', ')}.`;
  };

  const lines = [
    `# ${site.name}`,
    '',
    '> Guía para elegir motos en Argentina: fichas técnicas con fuentes, precios de referencia con fecha, ranking de patentamientos ACARA/SIOMAA, comparativas y calculadoras de costo.',
    '',
    'Cómo leer los datos:',
    '- Las especificaciones son las que declara cada marca en su sitio, ficha técnica o manual. Si la marca no publica un dato, figura como "No informado".',
    '- Cada precio indica su tipo (de lista, cotizado o de referencia de prensa) y la fecha en que se tomó. Los precios en Argentina cambian seguido.',
    '- CBS (frenado combinado) no es ABS. El peso se informa con su base (en seco u orden de marcha).',
    '- La potencia en hp es la declarada por la marca; cada marca puede medir con un método distinto.',
    `- Metodología: ${absoluteUrl(paths.methodology)}`,
    '',
    '## Fichas de motos',
    ...motos.map(modelLine),
    '',
    '## Listados por tipo, cilindrada y precio',
    ...hubs.map((hub) => `- [${hub.h1}](${absoluteUrl(hub.path)}): ${hub.seoDescription}`),
    `- [Motos eléctricas en Argentina](${absoluteUrl(paths.electric)})`,
    `- [Precios de motos en Argentina](${absoluteUrl(paths.prices)})`,
    `- [Motos más vendidas 2026](${absoluteUrl(paths.ranking2026)}): ranking de patentamientos ACARA/SIOMAA.`,
    '',
    '## Comparativas',
    ...comparisons.map((item) => `- [${item.data.title}](${absoluteUrl(`${paths.comparisons}${item.id}/`)}): ${item.data.description}`),
    '',
    '## Guías de compra',
    ...guides.map((item) => `- [${item.data.title}](${absoluteUrl(`${paths.guides}${item.id}/`)}): ${item.data.description}`),
    '',
    '## Datos y herramientas',
    `- [Catálogo en JSON](${absoluteUrl('/datos/motos.json')}): todas las fichas con especificaciones, precios, fechas y fuentes.`,
    `- [Calculadora de costo mensual](${absoluteUrl(paths.monthlyCost)})`,
    `- [Calculadora de combustible](${absoluteUrl(paths.fuel)})`,
    `- [Comparador de motos](${absoluteUrl(paths.comparator)})`,
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
