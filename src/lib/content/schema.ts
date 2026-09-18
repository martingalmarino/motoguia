import { z } from 'astro/zod';

export const statusSchema = z.enum(['draft', 'review', 'published']);
export const engineTypeSchema = z.enum(['combustion', 'electric']);
export const categorySchema = z.enum([
  'cub',
  'street',
  'scooter',
  'trail',
  'adventure',
  'sport',
  'touring',
  'other',
]);
export const availabilitySchema = z.enum(['available', 'discontinued', 'unverified']);

export const motorcycleSchema = z
  .object({
    id: z.string(),
    brandId: z.string(),
    name: z.string(),
    variant: z.string().nullable(),
    modelYear: z.number().int().nullable(),
    market: z.literal('AR'),
    status: statusSchema,
    indexable: z.boolean(),
    availability: availabilitySchema,
    availabilityCheckedAt: z.coerce.date(),
    availabilitySourceIds: z.array(z.string()),
    category: categorySchema,
    engineType: engineTypeSchema,
    chineseHub: z.boolean(),
    brandOriginCountry: z.string().nullable(),
    manufacturingCountry: z.string().nullable(),
    assemblyCountry: z.string().nullable(),
    importer: z.string().nullable(),
    price: z
      .object({
        minARS: z.number().nonnegative(),
        maxARS: z.number().nonnegative(),
        priceType: z.enum(['list', 'promotional', 'cash', 'quoted']),
        includesRegistration: z.boolean().nullable(),
        observedAt: z.coerce.date(),
        sourceIds: z.array(z.string()),
      })
      .nullable()
      .refine((value) => !value || value.minARS <= value.maxARS, {
        message: 'price.minARS must be <= price.maxARS',
      }),
    engine: z
      .object({
        displacementCc: z.number().positive().nullable(),
        powerKw: z.number().positive().nullable(),
        declaredPowerOriginalUnit: z.enum(['hp', 'kW']).nullable(),
        declaredPowerOriginalValue: z.number().positive().nullable(),
        torqueNm: z.number().positive().nullable(),
        cooling: z.string().nullable(),
        fuelSystem: z.string().nullable(),
        transmission: z.string().nullable(),
        gears: z.number().int().positive().nullable(),
      })
      .nullable(),
    chassis: z
      .object({
        brakesFront: z.string().nullable(),
        brakesRear: z.string().nullable(),
        abs: z.boolean().nullable(),
        cbs: z.boolean().nullable(),
        suspensionFront: z.string().nullable(),
        suspensionRear: z.string().nullable(),
        tireFront: z.string().nullable(),
        tireRear: z.string().nullable(),
      })
      .nullable(),
    dimensions: z
      .object({
        lengthMm: z.number().positive().nullable(),
        widthMm: z.number().positive().nullable(),
        heightMm: z.number().positive().nullable(),
        wheelbaseMm: z.number().positive().nullable(),
        seatHeightMm: z.number().positive().nullable(),
        weightKg: z.number().positive().nullable(),
        weightBasis: z.string().nullable(),
      })
      .nullable(),
    fuel: z
      .object({
        tankLiters: z.number().positive().nullable(),
        consumptionL100km: z.number().positive().nullable(),
        measurementBasis: z.string().nullable(),
        sourceIds: z.array(z.string()),
      })
      .nullable(),
    electric: z
      .object({
        nominalPowerKw: z.number().positive().nullable(),
        peakPowerKw: z.number().positive().nullable(),
        batteryKwh: z.number().positive().nullable(),
        capacityBasis: z.string().nullable(),
        voltageV: z.number().positive().nullable(),
        capacityAh: z.number().positive().nullable(),
        batteryChemistry: z.string().nullable(),
        removableBattery: z.boolean().nullable(),
        declaredRangeKm: z.number().positive().nullable(),
        rangeConditions: z.string().nullable(),
        chargingTimeHours: z.string().nullable(),
        chargingConditions: z.string().nullable(),
        warranty: z.string().nullable(),
      })
      .nullable(),
    editorial: z.object({
      summary: z.string(),
      suitableFor: z.array(z.string()),
      strengths: z.array(z.string()),
      limitations: z.array(z.string()),
      ownershipNotes: z.string(),
    }),
    images: z.array(
      z.object({
        path: z.string(),
        alt: z.string(),
        source: z.string(),
        rightsBasis: z.string(),
        credit: z.string(),
      }),
    ),
    sourceIds: z.array(z.string()).min(1),
    relatedModelIds: z.array(z.string()),
    relatedGuideIds: z.array(z.string()),
    accessoryCategoryIds: z.array(z.string()),
    rankingReportNames: z.array(z.string()),
    publishedAt: z.coerce.date(),
    reviewedAt: z.coerce.date(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    licenceHint: z.string().nullable(),
    warranty: z.string().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.engineType === 'electric' && value.engine?.displacementCc) {
      ctx.addIssue({
        code: 'custom',
        message: 'Electric models cannot have displacement',
        path: ['engine', 'displacementCc'],
      });
    }
  });

export const rankingRowSchema = z.object({
  rank: z.number().int().positive(),
  reportModelName: z.string(),
  modelIds: z.array(z.string()),
  units: z.number().int().nonnegative(),
  comparableChange: z.number().nullable(),
  comparisonPeriod: z.string().nullable(),
});

export const rankingSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  periodType: z.enum(['monthly', 'yearToDate', 'annual']),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  reportPublishedAt: z.coerce.date(),
  verifiedAt: z.coerce.date(),
  sourceIds: z.array(z.string()).min(1),
  metric: z.literal('registrations'),
  reportScope: z.string(),
  methodology: z.string(),
  rows: z.array(rankingRowSchema).min(1),
  status: statusSchema,
  indexable: z.boolean(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  editor: z.string(),
  status: statusSchema,
  indexable: z.boolean(),
  publishedAt: z.coerce.date(),
  reviewedAt: z.coerce.date(),
  sourceIds: z.array(z.string()),
  relatedModelIds: z.array(z.string()),
  relatedArticleIds: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export const comparisonSchema = articleSchema.extend({
  modelIds: z.array(z.string()).min(2).max(3),
});
