import { HttpStatus } from '../../src/constants/http-status';
import { KnownIssues, knownIssue } from '../../src/constants/known-issues';
import { expect, test } from '../../src/fixtures/api.fixtures';
import { parseBody } from '../../src/helpers/response';
import { PET_STATUSES, PetListSchema, type PetList } from '../../src/schemas/pet.schema';

test.describe('GET /pet/findByStatus - Find pets by status', () => {
  for (const status of PET_STATUSES) {
    test(
      `returns only "${status}" pets, including a newly created one`,
      { tag: '@smoke' },
      async ({ petClient, seedPet }) => {
        // The shared sandbox holds thousands of "available" pets; that response alone can take ~10s.
        test.slow(status === 'available', 'Large, slow findByStatus response in the shared sandbox');
        const pet = await seedPet({ status });
        let pets: PetList = [];

        await expect
          .poll(
            async () => {
              const response = await petClient.findByStatus(status);
              await expect(response).toHaveStatusCode(HttpStatus.OK);
              pets = await parseBody(response, PetListSchema);
              return pets.some(({ id }) => id === pet.id);
            },
            { message: `Pet ${pet.id} should be listed under "${status}"` },
          )
          .toBe(true);

        expect(pets.filter((listed) => listed.status !== status)).toEqual([]);
      },
    );
  }

  test('returns an empty list for an unsupported status', knownIssue(KnownIssues.BUG_03), async ({ petClient }) => {
    const response = await petClient.findByStatus('invalidStatusXYZ');

    // Spec: 400 Bad Request (status must be available | pending | sold).
    await expect(response).toHaveStatusCode(HttpStatus.OK);
    expect(await parseBody(response, PetListSchema)).toEqual([]);
  });

  test('returns an empty list when "status" is omitted', knownIssue(KnownIssues.BUG_04), async ({ petClient }) => {
    const response = await petClient.findByStatus();

    // Spec: 400 Bad Request ("status" is a required query parameter).
    await expect(response).toHaveStatusCode(HttpStatus.OK);
    expect(await parseBody(response, PetListSchema)).toEqual([]);
  });
});
