import { z } from 'zod';

/**
 * Zod schemas are the single source of truth: TypeScript types are inferred
 * from them, and the same schemas validate response contracts at runtime.
 */

export const PET_STATUSES = ['available', 'pending', 'sold'] as const;

export const PetStatusSchema = z.enum(PET_STATUSES);

export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const TagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const PetSchema = z.object({
  id: z.number().int(),
  category: CategorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(TagSchema).optional(),
  status: PetStatusSchema.optional(),
});

/**
 * Items returned by findByStatus. The shared sandbox contains records created
 * by anyone, so only the fields this suite relies on are enforced. `id` is
 * not `.int()`: other users' records use int64 ids beyond
 * Number.MAX_SAFE_INTEGER, which zod's int check rejects.
 */
export const PetListSchema = z.array(
  z.looseObject({
    id: z.number(),
    status: z.string(),
  }),
);

/** Generic `{ code, type, message }` envelope used by the Petstore API. */
export const ApiMessageSchema = z.object({
  code: z.number().int(),
  type: z.string(),
  message: z.string(),
});

export type PetStatus = z.infer<typeof PetStatusSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type PetList = z.infer<typeof PetListSchema>;
