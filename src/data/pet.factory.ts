import { randomInt } from 'node:crypto';
import type { Pet } from '../schemas/pet.schema';

/**
 * Random ids in a high, dedicated range so parallel workers and concurrent CI
 * runs never collide with each other or with other sandbox users' records.
 * Stays well within Number.MAX_SAFE_INTEGER.
 */
export function uniquePetId(): number {
  return 9_000_000_000 + randomInt(0, 999_999_999);
}

export const PetFactory = {
  valid(overrides: Partial<Pet> = {}): Pet {
    const id = overrides.id ?? uniquePetId();
    return {
      id,
      category: { id: 1, name: 'Dogs' },
      name: `qa-auto-pet-${id}`,
      photoUrls: ['https://example.com/photo.jpg'],
      tags: [{ id: 1, name: 'qa-automation' }],
      status: 'available',
      ...overrides,
    };
  },

  /** Omits the spec-required `name` and `photoUrls` fields. */
  missingRequiredFields(): { id: number; status: Pet['status'] } {
    return { id: uniquePetId(), status: 'available' };
  },

  /** Valid pet except that `id` is a string instead of an int64. */
  withNonNumericId(): Omit<Pet, 'id'> & { id: string } {
    return { ...PetFactory.valid(), id: 'not-a-number' };
  },
};
