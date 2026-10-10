import { test as baseTest } from "@playwright/test";
import { PetClient } from "../clients/pet.client";

type ApiFixtures = {
  petClient: PetClient;
};

export const test = baseTest.extend<ApiFixtures>({
  petClient: async ({ request }, use) => {
    await use(new PetClient(request));
  },
});

export { expect } from "@playwright/test";
