import { test, expect } from "../../src/fixtures/api.fixtures";
import { buildValidPet } from "../../src/utils/test-data";

test.describe("GET /pet/findByStatus - Find pets by status", () => {
  test("returns only pets matching the requested status @smoke", async ({ petClient }) => {
    const pet = buildValidPet({ status: "available" });
    await petClient.addPet(pet);

    const response = await petClient.findByStatus("available");

    expect(response.status()).toBe(200);
    const pets = await response.json();
    expect(Array.isArray(pets)).toBe(true);
    expect(pets.every((p: { status: string }) => p.status === "available")).toBe(true);
    expect(pets.some((p: { id: number }) => p.id === pet.id)).toBe(true);

    await petClient.deletePet(pet.id!);
  });

  test("[known issue BUG-03] returns 200 with an empty array for an unsupported status value", async ({
    petClient,
  }) => {
    // Expected per spec: 400 Bad Request (status must be one of
    // available | pending | sold). Observed: 200 with []. See BUG-03.
    const response = await petClient.findByStatus("invalidStatusXYZ");

    expect(response.status()).toBe(200); // documents current (non-compliant) behavior
    const pets = await response.json();
    expect(pets).toEqual([]);
  });

  test("[known issue BUG-04] returns 200 with an empty array when the required status param is omitted", async ({
    petClient,
  }) => {
    // "status" is documented as a required query parameter.
    // Observed: omitting it still returns 200 with []. See BUG-04.
    const response = await petClient.findByStatus();

    expect(response.status()).toBe(200); // documents current (non-compliant) behavior
    const pets = await response.json();
    expect(pets).toEqual([]);
  });
});
