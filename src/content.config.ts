import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { articleSchema, blogSchema, comparisonSchema, motorcycleSchema, rankingSchema } from './lib/content/schema';

const motorcycles = defineCollection({
  loader: glob({ base: './src/content/motorcycles', pattern: '**/*.md' }),
  schema: motorcycleSchema,
});

const rankings = defineCollection({
  loader: glob({ base: './src/content/rankings', pattern: '**/*.json' }),
  schema: rankingSchema,
});

const guideFaqSchema = z
  .array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  )
  .optional();

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.md' }),
  schema: articleSchema.extend({ faqs: guideFaqSchema }),
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

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

export const collections = {
  motorcycles,
  rankings,
  guides,
  comparisons,
  accessoryGuides,
  blog,
};
