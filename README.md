# Petstore API Automation

API automation suite for the public [Swagger Petstore](https://petstore.swagger.io/v2) API, built with [Playwright Test](https://playwright.dev/docs/api-testing) (`@playwright/test` request context — no browser needed).

Covers the 3 endpoints from the QA Take Home Test, Task 2:

- `POST /pet` — Add a new pet
- `GET /pet/findByStatus` — Find pets by status
- `DELETE /pet/{petId}` — Delete a pet by ID

Each endpoint has one happy-path test and the negative/edge cases documented in the Task 1 manual test report (`REPORT.md` in this repo), so the discrepancies between the Swagger documentation and the live API's actual behavior are also captured as automated, repeatable checks.

## Project structure

```
petstore-api-automation/
├── .github/workflows/api-tests.yml   # CI pipeline (GitHub Actions)
├── config/
│   ├── env.config.ts                 # environment variables (dotenv)
│   └── playwright.config.ts          # Playwright Test configuration
├── src/
│   ├── clients/pet.client.ts         # typed API client for /pet endpoints
│   ├── fixtures/api.fixtures.ts      # custom fixture injecting petClient
│   ├── types/pet.types.ts            # Pet/Category/Tag TypeScript types
│   └── utils/test-data.ts            # test data builders
├── tests/api/
│   ├── post-pet.spec.ts
│   ├── find-by-status.spec.ts
│   └── delete-pet.spec.ts
├── .env.example
├── package.json
├── tsconfig.json
└── REPORT.md                         # test execution report
```

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
cp .env.example .env   # optional, defaults already point at the public sandbox
```

## Running the tests

```bash
# Run the full suite headlessly
npm test

# Run with Playwright's UI runner (interactive)
npm run test:ui 2>/dev/null || npx playwright test --config=config/playwright.config.ts --ui

# Step-through debug mode
npm run test:debug

# Open the last HTML report
npm run report
```

Run a single file or test by name:

```bash
npx playwright test --config=config/playwright.config.ts tests/api/post-pet.spec.ts
npx playwright test --config=config/playwright.config.ts -g "deletes an existing pet"
```

## Configuration

The target API base URL is read from `config/env.config.ts`, which loads `.env` (see `.env.example`). It defaults to `https://petstore.swagger.io/v2`, the public Petstore sandbox, so no setup is required to run the suite out of the box.

## Design notes

- **No Page Object Model here** — this is pure API testing, so the equivalent abstraction is a typed **API client** (`src/clients/pet.client.ts`) that wraps raw HTTP calls behind readable method names (`addPet`, `findByStatus`, `deletePet`). Specs assert on responses; they never build requests by hand.
- **Fixtures** (`src/fixtures/api.fixtures.ts`) inject `petClient` into every test via Playwright's fixture system, avoiding repeated setup code.
- **Test data builders** (`src/utils/test-data.ts`) generate unique pet IDs per run (`Date.now()`-based) so parallel runs against the shared public sandbox never collide.
- **Known-issue tests** are explicitly labeled `[known issue BUG-0x]` in their titles and commented with the expected (spec) vs. observed (actual) behavior, cross-referenced to `REPORT.md`. They assert the *currently observed* behavior so the suite stays green and acts as a regression guard — if the mismatch is ever fixed upstream, the assertion will start failing and flag that the test (and the bug entry) need to be updated.

## CI/CD

`.github/workflows/api-tests.yml` runs the full suite on every push/PR to `main` and uploads the Playwright HTML report as a build artifact.
