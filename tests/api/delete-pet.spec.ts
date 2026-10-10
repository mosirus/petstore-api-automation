import { test, expect } from "../../src/fixtures/api.fixtures";
import { buildValidPet } from "../../src/utils/test-data";

test.describe("DELETE /pet/{petId} - Delete a pet by ID", () => {
  test("deletes an existing pet and the record is no longer retrievable @smoke", async ({ petClient }) => {
    const pet = buildValidPet();
    await petClient.addPet(pet);

    const deleteResponse = await petClient.deletePet(pet.id!);
    expect(deleteResponse.status()).toBe(200);
    const deleteBody = await deleteResponse.json();
    expect(String(deleteBody.message)).toBe(String(pet.id));

    const verifyResponse = await petClient.getPetById(pet.id!);
    expect(verifyResponse.status()).toBe(404);
  });

  test("[known issue BUG-05] returns 200 instead of 404 when deleting a non-existent pet id", async ({
    petClient,
  }) => {
    // Expected per REST conventions: 404 Not Found when there is nothing
    // to delete. Observed: 200 OK with a false-positive success body.
    // See BUG-05.
    const nonExistentId = 999_999_999;

    const response = await petClient.deletePet(nonExistentId);

    expect(response.status()).toBe(200); // documents current (non-compliant) behavior
    const body = await response.json();
    expect(String(body.message)).toBe(String(nonExistentId));
  });

  test("[known issue BUG-06] leaks an internal stack trace for a non-numeric petId", async ({ petClient }) => {
    // Expected: 400 Bad Request with a clean validation message.
    // Observed: 404 Not Found whose message embeds a raw Java
    // NumberFormatException. See BUG-06.
    const response = await petClient.deletePet("abc");

    expect(response.status()).toBe(404); // documents current (non-compliant) behavior
    const body = await response.json();
    expect(body.message).toContain("NumberFormatException");
  });
});
