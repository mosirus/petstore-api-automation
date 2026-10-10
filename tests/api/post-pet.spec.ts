import { test, expect } from "../../src/fixtures/api.fixtures";
import { buildValidPet } from "../../src/utils/test-data";

test.describe("POST /pet - Add a new pet", () => {
  test("creates a pet and echoes the submitted payload @smoke", async ({ petClient }) => {
    const pet = buildValidPet();

    const response = await petClient.addPet(pet);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(pet.id);
    expect(body.name).toBe(pet.name);
    expect(body.status).toBe(pet.status);
    expect(body.category).toMatchObject({ ...pet.category });

    // teardown: remove the record we created
    await petClient.deletePet(pet.id!);
  });

  test("[known issue BUG-01] accepts a payload missing required fields instead of rejecting it", async ({
    petClient,
  }) => {
    // Per the Swagger spec, "name" and "photoUrls" are required. The live
    // sandbox does not enforce this and returns 200 instead of 400.
    // See Task 1 report, BUG-01, for the documented mismatch.
    const incompletePayload = { id: Date.now(), status: "available" };

    const response = await petClient.addPet(incompletePayload);

    expect(response.status()).toBe(200); // documents current (non-compliant) behavior
    const body = await response.json();
    expect(body.name).toBeUndefined();

    await petClient.deletePet(incompletePayload.id);
  });

  test("[known issue BUG-02] returns 500 instead of 400 for an invalid id type", async ({ petClient }) => {
    // Expected per spec: 400 Bad Request with a validation message.
    // Observed: 500 Internal Server Error. See Task 1 report, BUG-02.
    const invalidPayload = {
      id: "not-a-number",
      name: "typeTest",
      photoUrls: ["https://example.com/photo.jpg"],
      status: "available",
    };

    const response = await petClient.addPet(invalidPayload);

    expect(response.status()).toBe(500); // documents current (non-compliant) behavior
    const body = await response.json();
    expect(body.message).toBe("something bad happened");
  });
});
