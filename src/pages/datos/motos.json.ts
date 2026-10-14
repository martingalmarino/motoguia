import type { APIRoute } from 'astro';
import { site } from '../../config/site';
import { getPublishedMotorcycles } from '../../lib/content/catalog';
import { modelRecord } from '../../lib/seo/catalog-data';
import { absoluteUrl } from '../../lib/seo/urls';

export const GET: APIRoute = async () => {
  const motos = await getPublishedMotorcycles();
  const newest = motos.map((entry) => entry.data.reviewedAt).sort((a, b) => b.valueOf() - a.valueOf())[0];
  const body = {
    name: `${site.name}: catálogo de motos en Argentina`,
    description:
      'Fichas de motos que se venden en Argentina con datos declarados por cada marca. Los valores null indican datos que la marca no publica. Los precios llevan tipo y fecha.',
    url: absoluteUrl('/datos/motos.json'),
    methodology: absoluteUrl('/metodologia/'),
    language: 'es-AR',
    updatedAt: newest?.toISOString().slice(0, 10) ?? null,
    count: motos.length,
    motorcycles: motos.map(modelRecord),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
