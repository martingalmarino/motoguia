import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { motorcycleSchema } from '../src/lib/content/schema';
import { modelFaqs } from '../src/lib/content/faq';
import { hubFaqs } from '../src/lib/content/hub-faq';
import { HUBS, activeHubs, hubModels } from '../src/lib/content/hubs';
import { motorcycleLd } from '../src/lib/seo/jsonld';

const dir = join(process.cwd(), 'src/content/motorcycles');
const models = readdirSync(dir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const text = readFileSync(join(dir, file), 'utf8');
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    return { id: file.replace(/\.md$/, ''), data: motorcycleSchema.parse(parse(frontmatter)) };
  })
  .filter((entry) => entry.data.status === 'published');

function findBlank(value: unknown, path = '$'): string | null {
  if (value === null || value === undefined || value === '') return path;
  if (typeof value === 'number' && !Number.isFinite(value)) return path;
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const found = findBlank(item, `${path}[${index}]`);
      if (found) return found;
    }
  } else if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const found = findBlank(item, `${path}.${key}`);
      if (found) return found;
    }
  }
  return null;
}

describe('model structured data', () => {
  it('loads every published model', () => {
    expect(models.length).toBeGreaterThan(0);
  });

  it.each(models.map((entry) => [entry.id, entry]))('%s has no empty values', (_id, entry) => {
    const ld = motorcycleLd(entry as any, { path: `/motos/x/${entry.id}/`, images: ['/images/x.webp'] });
    expect(findBlank(ld)).toBeNull();
    expect(ld['@type']).toEqual(['Product', 'Motorcycle']);
  });

  it('only publishes offers for models with a price', () => {
    for (const entry of models) {
      const ld = motorcycleLd(entry as any, { path: '/x/', images: [] }) as Record<string, unknown>;
      expect(Boolean(ld.offers)).toBe(Boolean(entry.data.price));
      expect(ld).not.toHaveProperty('review');
      expect(ld).not.toHaveProperty('aggregateRating');
    }
  });
});

describe('model FAQs', () => {
  it.each(models.map((entry) => [entry.id, entry]))('%s has unique, complete answers', (_id, entry) => {
    const faqs = modelFaqs(entry as any);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    const ids = faqs.map((faq) => faq.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const faq of faqs) {
      expect(faq.question.endsWith('?')).toBe(true);
      expect(faq.answer.length).toBeGreaterThan(20);
      expect(faq.answer).not.toMatch(/undefined|null|NaN/);
    }
  });

  it('does not invent a price for models without one', () => {
    for (const entry of models.filter((model) => !model.data.price)) {
      const price = modelFaqs(entry as any).find((faq) => faq.id === 'precio');
      if (price) expect(price.answer).not.toMatch(/\$\s?\d/);
    }
  });
});

describe('intent hubs', () => {
  it('only activates hubs with enough models', () => {
    for (const hub of activeHubs(models as any)) {
      expect(hubModels(hub, models as any).length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(HUBS.map((hub) => [hub.key, hub]))('%s FAQs are well formed', (_key, hub) => {
    const members = hubModels(hub, models as any);
    if (members.length === 0) return;
    for (const faq of hubFaqs(hub, members)) {
      expect(faq.question.endsWith('?')).toBe(true);
      expect(faq.answer).not.toMatch(/undefined|null|NaN/);
    }
  });
});
