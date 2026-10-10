# Task 2 — API Automation Test Report

**Target:** Swagger Petstore API — `https://petstore.swagger.io/v2`
**Framework:** Playwright Test (request context), TypeScript, zod
**Endpoints covered:** `POST /pet`, `GET /pet/findByStatus`, `DELETE /pet/{petId}`

## Suite overview

| Spec file                               | Tests  | Smoke | Known issue    | Maps to manual TC (Task 1) |
| --------------------------------------- | ------ | ----- | -------------- | -------------------------- |
| `tests/pet/add-pet.spec.ts`             | 4      | 1     | BUG-01, BUG-02 | TC-01, TC-02, TC-03        |
| `tests/pet/find-pets-by-status.spec.ts` | 5      | 3     | BUG-03, BUG-04 | TC-04, TC-05, TC-06        |
| `tests/pet/delete-pet.spec.ts`          | 3      | 1     | BUG-05         | TC-07, TC-08, TC-09        |
| **Total**                               | **12** | **5** | **5**          |                            |

Compared with v1, the findByStatus happy path is data-driven across all three statuses. POST also has a separate read-after-write test that confirms the pet is actually persisted, not just echoed back.

## Fix in v2: base URL dropped `/v2`

In v1, `baseURL` was `https://petstore.swagger.io/v2` and endpoint paths started with `/` (`"/pet"`). Under standard URL resolution, a leading slash replaces the base path, so every request went to `https://petstore.swagger.io/pet`. That means all 9 v1 tests would have failed against the live API.

v2 normalizes the base URL to end with `/` and uses relative paths (`"pet"`). `BaseApiClient` now rejects leading-slash paths, so this can't come back.

## Validation performed

| Check                                                                     | Result                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `npm run typecheck` (`tsc`, strict)                                       | ✅ Pass                                                         |
| `npm run lint` (strictTypeChecked + playwright plugin)                    | ✅ Pass                                                         |
| `npm run format:check` (Prettier)                                         | ✅ Pass                                                         |
| Full suite against a local mock reproducing the observed sandbox behavior | ✅ 12/12 pass; every request hit `/v2/...`; no pets left behind |
| Cleanup on failure (deliberately failing test)                            | ✅ Seeded pet still deleted by fixture teardown                 |
| Full suite against live `petstore.swagger.io` (`--repeat-each 2`)         | ✅ 24/24 pass (2026-10-10)                                      |

The first live run surfaced two issues, both fixed: (1) other users' pets in the sandbox use int64 ids beyond `Number.MAX_SAFE_INTEGER`, so the list schema no longer applies `.int()` to `id`; (2) the "delete non-existent pet returns 200" finding did not reproduce with a never-created id and was dropped (see below). The `available` listing is very large and slow (~10s), so that test is marked `test.slow()`.

## Expected results against the live sandbox

| Group                    | Expected | Notes                                                                                                         |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| 5 × `@smoke` + 1 persist | PASS     | Match spec behavior. `expect.poll` + CI retries absorb the sandbox's eventual consistency.                    |
| 5 × `@known-issue`       | PASS     | Assert the current non-compliant behavior. A failure means upstream behavior changed; update the issue entry. |

## Known issues encoded as tests

Registry: `src/constants/known-issues.ts`. Each one appears as an `issue` annotation in the HTML report.

| Bug ID | Endpoint              | Expected (spec) | Observed                                          |
| ------ | --------------------- | --------------- | ------------------------------------------------- |
| BUG-01 | POST /pet             | 400             | 200 — missing `name`/`photoUrls` accepted         |
| BUG-02 | POST /pet             | 400             | 500 `something bad happened` for non-numeric `id` |
| BUG-03 | GET /pet/findByStatus | 400             | 200 `[]` for unsupported status                   |
| BUG-04 | GET /pet/findByStatus | 400             | 200 `[]` when `status` is omitted                 |
| BUG-05 | DELETE /pet/{petId}   | 400             | 404 with leaked `NumberFormatException`           |

> **Dropped finding:** Task 1 originally reported that deleting a non-existent pet returned 200 instead of 404. That observation used the fixed id `999999999`, which existed in the shared sandbox. With a never-created id the API correctly returns 404, so it is now covered by a regular (non-known-issue) test and the bug list was renumbered.
