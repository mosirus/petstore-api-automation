# Petstore API Automation

API automation suite for the public [Swagger Petstore](https://petstore.swagger.io/v2) API, built with [Playwright Test](https://playwright.dev/docs/api-testing) and TypeScript. It uses Playwright's request context only — no browser is installed or launched.

Endpoints covered (QA Take Home Test, Task 2):

| Endpoint                | Spec file                               | Happy path                               | Known issues   |
| ----------------------- | --------------------------------------- | ---------------------------------------- | -------------- |
| `POST /pet`             | `tests/pet/add-pet.spec.ts`             | create + persist                         | BUG-01, BUG-02 |
| `GET /pet/findByStatus` | `tests/pet/find-pets-by-status.spec.ts` | one per status (×3)                      | BUG-03, BUG-04 |
| `DELETE /pet/{petId}`   | `tests/pet/delete-pet.spec.ts`          | delete + verify gone, 404 for unknown id | BUG-05         |

## Quick start

Requires Node.js 20.19+.

```bash
npm ci
cp .env.example .env   # optional — defaults target the public sandbox
npm test
```

| Script                      | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm test`                  | Run the full suite                           |
| `npm run test:smoke`        | Run only `@smoke` tests                      |
| `npm run test:known-issues` | Run only `@known-issue` tests                |
| `npm run test:ui`           | Playwright UI mode                           |
| `npm run report`            | Open the last HTML report                    |
| `npm run verify`            | Typecheck + lint + format check (runs in CI) |

## Project structure

```
├── playwright.config.ts          # runner config: reporters, retries, traces
├── src/
│   ├── config.ts                 # env vars, validated with zod
│   ├── api/
│   │   ├── base.client.ts        # shared HTTP plumbing (the API "BasePage")
│   │   └── pet.client.ts         # /pet endpoints (the API "page object")
│   ├── schemas/pet.schema.ts     # zod contracts; TS types are inferred from them
│   ├── data/pet.factory.ts       # test data builders + unique id generation
│   ├── fixtures/
│   │   ├── api.fixtures.ts       # petClient, seedPet, trackPetForCleanup
│   │   └── matchers.ts           # custom expect matchers (toHaveStatusCode)
│   ├── helpers/response.ts       # parseBody(): JSON + schema validation, typed
│   └── constants/                # HttpStatus, KnownIssues registry
└── tests/pet/*.spec.ts           # scenarios and assertions only
```

## Design principles

**Layered, single-responsibility architecture.** Specs describe behavior and own the assertions. Clients only know how to call endpoints and return the raw `APIResponse`. Fixtures handle setup and teardown. Factories own test data. No spec builds a URL or a payload by hand.

**Contract testing with zod.** `parseBody(response, PetSchema)` validates the body at runtime and returns a fully typed value, so a contract break fails with a readable schema diff instead of an `undefined` deep in an assertion. The schemas are also the single source of truth for TypeScript types.

**Guaranteed cleanup.** Every pet a test creates is registered through `seedPet` or `trackPetForCleanup`. Fixture teardown deletes those pets even when the test fails, so the shared sandbox doesn't fill up with leftovers.

**Built for a shared, eventually consistent sandbox.**

- Pet ids are random and drawn from a dedicated high range, so parallel workers and concurrent CI runs don't collide.
- Read-after-write checks use `expect.poll`, because the load-balanced sandbox doesn't always serve a new or deleted pet immediately.
- `seedPet` waits until the pet is readable before handing it to the test.
- CI retries twice. Traces (including every request and response) are kept on failure.

**Fail-fast guard against the base-URL trap.** Endpoint paths are relative (`pet`, not `/pet`) and the base URL always ends with `/`. A leading slash would resolve against the host root and silently drop `/v2`, so `BaseApiClient` throws if one is used.

**Readable reports.** Each HTTP call is a boxed `test.step` (e.g. `POST pet`). `toHaveStatusCode` prints the URL and response body on failure.

**Known issues as first-class metadata.** The spec deviations found in Task 1 live in `src/constants/known-issues.ts`. Tests attach them with `knownIssue(KnownIssues.BUG_0x)`, which adds the `@known-issue` tag and an `issue` annotation shown in the HTML report. These tests assert the _currently observed_ behavior, with the spec expectation in a comment. They act as regression guards: if the API is fixed upstream, the test fails and flags that the issue entry needs revisiting.

**Static quality gates.** TypeScript `strict` (plus `noUncheckedIndexedAccess`), `typescript-eslint` `strictTypeChecked` (including `no-floating-promises`, the most common cause of false-green API tests), `eslint-plugin-playwright`, and Prettier.

## Configuration

| Variable         | Default                          | Description              |
| ---------------- | -------------------------------- | ------------------------ |
| `API_BASE_URL`   | `https://petstore.swagger.io/v2` | Base URL of the API      |
| `API_TIMEOUT_MS` | `15000`                          | Per-request timeout (ms) |

Values are validated at startup. An invalid URL fails immediately with a clear message.

## CI/CD

`.github/workflows/api-tests.yml` runs on push and PR to `main`/`master`, on manual dispatch, and daily (to catch upstream sandbox changes). It runs `npm run verify` and then the suite, and uploads the HTML report plus JUnit results and traces as artifacts.
