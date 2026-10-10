import { APIRequestContext, APIResponse } from "@playwright/test";
import { Pet, PetStatus } from "../types/pet.types";

/**
 * Thin, typed wrapper around the Petstore `/pet` endpoints.
 * Keeps raw request plumbing out of the test files (the API equivalent
 * of a Page Object for UI tests) so specs read as business intent.
 */
export class PetClient {
  constructor(private readonly request: APIRequestContext) {}

  async addPet(payload: unknown): Promise<APIResponse> {
    return this.request.post("/pet", { data: payload });
  }

  async getPetById(petId: number | string): Promise<APIResponse> {
    return this.request.get(`/pet/${petId}`);
  }

  async findByStatus(status?: PetStatus | string): Promise<APIResponse> {
    const query = status !== undefined ? `?status=${encodeURIComponent(status)}` : "";
    return this.request.get(`/pet/findByStatus${query}`);
  }

  async deletePet(petId: number | string): Promise<APIResponse> {
    return this.request.delete(`/pet/${petId}`);
  }

  /** Convenience helper used in setup/teardown to create a known-good pet. */
  async createAndReturn(payload: Pet): Promise<Pet> {
    const res = await this.addPet(payload);
    return res.json();
  }
}
