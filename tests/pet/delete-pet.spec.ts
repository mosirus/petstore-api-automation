import { HttpStatus } from '../../src/constants/http-status';
import { KnownIssues, knownIssue } from '../../src/constants/known-issues';
import { uniquePetId } from '../../src/data/pet.factory';
import { expect, test } from '../../src/fixtures/api.fixtures';
import { parseBody } from '../../src/helpers/response';
import { ApiMessageSchema } from '../../src/schemas/pet.schema';

test.describe('DELETE /pet/{petId} - Delete a pet', () => {
  test('deletes an existing pet so it is no longer retrievable', { tag: '@smoke' }, async ({ petClient, seedPet }) => {
    const pet = await seedPet();

    const response = await petClient.deletePet(pet.id);

    await expect(response).toHaveStatusCode(HttpStatus.OK);
    const body = await parseBody(response, ApiMessageSchema);
    expect(body.message).toBe(String(pet.id));

    await expect
      .poll(async () => (await petClient.getPetById(pet.id)).status(), {
        message: `Pet ${pet.id} should be gone after deletion`,
      })
      .toBe(HttpStatus.NOT_FOUND);
  });

  test('returns 404 for a non-existent pet id', async ({ petClient }) => {
    const neverCreatedId = uniquePetId();

    const response = await petClient.deletePet(neverCreatedId);

    await expect(response).toHaveStatusCode(HttpStatus.NOT_FOUND);
  });

  test('leaks a stack trace for a non-numeric pet id', knownIssue(KnownIssues.BUG_05), async ({ petClient }) => {
    const response = await petClient.deletePet('abc');

    // Spec: 400 Bad Request with a clean validation message.
    await expect(response).toHaveStatusCode(HttpStatus.NOT_FOUND);
    const body = await parseBody(response, ApiMessageSchema);
    expect(body.message).toContain('NumberFormatException');
  });
});
