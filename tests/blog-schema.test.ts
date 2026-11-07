import { describe, expect, it } from 'vitest';
import { blogSchema } from '../src/lib/content/schema';

const heroImage = {
  path: '/images/blog/ejemplo.jpg',
  alt: 'Foto de portada',
  width: 1200,
  height: 675,
};

const base = {
  title: 'Título de prueba',
  description: 'Descripción de prueba',
  pubDate: new Date('2026-10-15'),
  author: 'Lautaro Diaz',
  heroImage,
  status: 'published' as const,
  indexable: true,
};

describe('blog schema', () => {
  it('acepta un post sin categoría', () => {
    expect(blogSchema.parse(base).category).toBeUndefined();
  });

  it('guarda la etiqueta de categoría', () => {
    expect(blogSchema.parse({ ...base, category: 'Mercado' }).category).toBe('Mercado');
  });

  it('rechaza una categoría vacía', () => {
    expect(blogSchema.safeParse({ ...base, category: '' }).success).toBe(false);
  });
});
