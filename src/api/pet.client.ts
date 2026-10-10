import type { APIResponse } from '@playwright/test';
import type { Pet, PetStatus } from '../schemas/pet.schema';
import { BaseApiClient } from './base.client';

type PetId = number | string;

const Endpoints = {
  pet: 'pet',
  petById: (petId: PetId) => `pet/${encodeURIComponent(String(petId))}`,
  findByStatus: 'pet/findByStatus',
} as const;

/** Client for the Petstore `/pet` resource. Returns raw responses; specs own the assertions. */
export class PetClient extends BaseApiClient {
  addPet(pet: Pet): Promise<APIResponse> {
    return this.post(Endpoints.pet, { data: pet });
  }

  /** Sends an arbitrary body to POST /pet. Intended for negative/contract tests only. */
  addPetWithRawBody(body: unknown): Promise<APIResponse> {
    return this.post(Endpoints.pet, { data: body });
  }

  getPetById(petId: PetId): Promise<APIResponse> {
    return this.get(Endpoints.petById(petId));
  }

  /** Omitting `status` sends the request without the query parameter at all. */
  findByStatus(status?: PetStatus | (string & {})): Promise<APIResponse> {
    return this.get(Endpoints.findByStatus, status === undefined ? {} : { params: { status } });
  }

  deletePet(petId: PetId): Promise<APIResponse> {
    return this.delete(Endpoints.petById(petId));
  }
}
