import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, comparisonSchema, motorcycleSchema, rankingSchema } from './lib/content/schema';

const motorcycles = defineCollection({
  loader: glob({ base: './src/content/motorcycles', pattern: '**/*.md' }),
  schema: motorcycleSchema,
});

const rankings = defineCollection({
  loader: glob({ base: './src/content/rankings', pattern: '**/*.json' }),
  schema: rankingSchema,
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.md' }),
  schema: articleSchema,
});

const comparisons = defineCollection({
  loader: glob({ base: './src/content/comparisons', pattern: '**/*.md' }),
  schema: comparisonSchema,
});

const accessoryGuides = defineCollection({
  loader: glob({ base: './src/content/accessory-guides', pattern: '**/*.md' }),
  schema: articleSchema.extend({
    accessoryCategoryIds: motorcycleSchema.shape.accessoryCategoryIds,
  }),
});

export const collections = {
  motorcycles,
  rankings,
  guides,
  comparisons,
  accessoryGuides,
};
