import { Pet } from "../types/pet.types";

/**
 * Generates a unique numeric id for test pets so parallel test runs
 * never collide on the same record in the shared public sandbox.
 */
export function generatePetId(): number {
  // Timestamp-based id kept within a safe integer range for the API.
  return Number(`9${Date.now().toString().slice(-8)}`);
}

export function buildValidPet(overrides: Partial<Pet> = {}): Pet {
  const id = overrides.id ?? generatePetId();
  return {
    id,
    category: { id: 1, name: "Dogs" },
    name: `qa-automation-pet-${id}`,
    photoUrls: ["https://example.com/photo.jpg"],
    tags: [{ id: 1, name: "friendly" }],
    status: "available",
    ...overrides,
  };
}
