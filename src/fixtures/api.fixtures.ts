import { test as base } from '@playwright/test';
import { PetClient } from '../api/pet.client';
import { HttpStatus } from '../constants/http-status';
import { PetFactory } from '../data/pet.factory';
import type { Pet } from '../schemas/pet.schema';
import { expect } from './matchers';

type ApiFixtures = {
  petClient: PetClient;
  /** Registers pet ids to be deleted after the test, even when it fails. */
  trackPetForCleanup: (petId: number) => void;
  /** Creates a pet as a test precondition and schedules its cleanup. */
  seedPet: (overrides?: Partial<Pet>) => Promise<Pet>;
};

export const test = base.extend<ApiFixtures>({
  petClient: async ({ request }, use) => {
    await use(new PetClient(request));
  },

  trackPetForCleanup: async ({ petClient }, use) => {
    const petIds = new Set<number>();
    await use((petId) => petIds.add(petId));

    // Best effort: a 404 here just means the test already deleted the pet.
    await Promise.all([...petIds].map((petId) => petClient.deletePet(petId)));
  },

  seedPet: async ({ petClient, trackPetForCleanup }, use) => {
    await use(async (overrides) => {
      const pet = PetFactory.valid(overrides);
      const response = await petClient.addPet(pet);
      await expect(response, 'Precondition failed: could not seed pet').toBeOK();
      trackPetForCleanup(pet.id);

      // The sandbox is load-balanced and eventually consistent: wait until the
      // pet is readable so tests don't race against replication.
      await expect
        .poll(async () => (await petClient.getPetById(pet.id)).status(), {
          message: `Seeded pet ${pet.id} never became readable`,
        })
        .toBe(HttpStatus.OK);

      return pet;
    });
  },
});

export { expect };
