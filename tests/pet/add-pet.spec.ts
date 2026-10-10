import { HttpStatus } from '../../src/constants/http-status';
import { KnownIssues, knownIssue } from '../../src/constants/known-issues';
import { PetFactory } from '../../src/data/pet.factory';
import { expect, test } from '../../src/fixtures/api.fixtures';
import { parseBody } from '../../src/helpers/response';
import { ApiMessageSchema, PetSchema } from '../../src/schemas/pet.schema';

test.describe('POST /pet - Add a new pet', () => {
  test('creates a pet and echoes it back', { tag: '@smoke' }, async ({ petClient, trackPetForCleanup }) => {
    const pet = PetFactory.valid();
    trackPetForCleanup(pet.id);

    const response = await petClient.addPet(pet);

    await expect(response).toHaveStatusCode(HttpStatus.OK);
    expect(await parseBody(response, PetSchema)).toEqual(pet);
  });

  test('persists the created pet so it is retrievable by id', async ({ petClient, trackPetForCleanup }) => {
    const pet = PetFactory.valid();
    trackPetForCleanup(pet.id);

    await petClient.addPet(pet);

    await expect
      .poll(async () => {
        const response = await petClient.getPetById(pet.id);
        return response.ok() ? ((await response.json()) as unknown) : response.status();
      })
      .toEqual(pet);
  });

  test(
    'accepts a payload missing required fields',
    knownIssue(KnownIssues.BUG_01),
    async ({ petClient, trackPetForCleanup }) => {
      const payload = PetFactory.missingRequiredFields();
      trackPetForCleanup(payload.id);

      const response = await petClient.addPetWithRawBody(payload);

      // Spec: 400 Bad Request ("name" and "photoUrls" are required).
      await expect(response).toHaveStatusCode(HttpStatus.OK);
      const body: unknown = await response.json();
      expect(body).toMatchObject({ id: payload.id });
      expect(body).not.toHaveProperty('name');
    },
  );

  test('returns 500 for a non-numeric id', knownIssue(KnownIssues.BUG_02), async ({ petClient }) => {
    const response = await petClient.addPetWithRawBody(PetFactory.withNonNumericId());

    // Spec: 400 Bad Request with a validation message.
    await expect(response).toHaveStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = await parseBody(response, ApiMessageSchema);
    expect(body.message).toBe('something bad happened');
  });
});
